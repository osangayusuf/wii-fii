<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Voucher extends Model
{
    protected $fillable = [
        'user_id',
        'service_plan_id',
        'code',
        'is_active',
        'active_devices',
        'allowed_devices',
        'status',
        'used_time',
        'activation_time',
    ];

    protected $casts = [
        'activation_time' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($voucher) {
            // Generate a unique voucher code if not provided
            if (empty($voucher->code)) {
                $voucher->code = self::generateUniqueCode();
            }

            // Set allowed devices from service plan if not explicitly set
            if (empty($voucher->allowed_devices)) {
                $servicePlan = ServicePlan::find($voucher->service_plan_id);
                if ($servicePlan) {
                    $voucher->allowed_devices = $servicePlan->max_devices;
                }
            }
        });
    }

    /**
     * Get the user that owns the voucher.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the service plan for the voucher.
     */
    public function servicePlan(): BelongsTo
    {
        return $this->belongsTo(ServicePlan::class);
    }

    /**
     * Get the device sessions for the voucher.
     */
    public function deviceSessions(): HasMany
    {
        return $this->hasMany(DeviceSession::class);
    }

    /**
     * Generate a unique voucher code.
     */
    public static function generateUniqueCode(): string
    {
        $code = strtoupper(Str::random(8));

        // Check if code already exists
        while (self::where('code', $code)->exists()) {
            $code = strtoupper(Str::random(8));
        }

        return $code;
    }

    /**
     * Activate the voucher.
     */
    public function activate(): bool
    {
        if ($this->status !== 'unused' && $this->status !== 'paused') {
            return false;
        }

        $now = now();

        // Set activation time to now
        $this->activation_time = $now;
        $this->status = 'active';
        $this->is_active = true;

        return $this->save();
    }

    /**
     * Pause the voucher.
     */
    public function pause(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $now = now();

        // Update used_time with the time spent since activation
        if ($this->activation_time) {
            $usedMinutesSinceActivation = $this->activation_time->diffInMinutes($now);
            $this->used_time += $usedMinutesSinceActivation;
        }

        $this->status = 'paused';
        $this->is_active = false;

        return $this->save();
    }

    /**
     * Expire the voucher.
     */
    public function expire(): bool
    {
        // Update used_time if the voucher was active
        if ($this->status === 'active' && $this->activation_time) {
            $now = now();
            $usedMinutesSinceActivation = $now->diffInMinutes($this->activation_time);
            $this->used_time += $usedMinutesSinceActivation;
        }

        $this->status = 'expired';
        $this->is_active = false;

        return $this->save();
    }

    /**
     * Check if the voucher is valid.
     */
    public function isValid(): bool
    {
        // If the voucher is unused or paused, it's still valid for connection
        if ($this->status === 'unused' || $this->status === 'paused') {
            return true;
        }

        // Check active status
        if (!$this->is_active) {
            return false;
        }

        // Check if expired
        if ($this->status === 'expired') {
            return false;
        }

        // For active vouchers, check if the time limit would be exceeded
        if ($this->status === 'active' && $this->activation_time) {
            $now = now();
            $servicePlanDurationMinutes = $this->servicePlan ? ($this->servicePlan->duration_hours * 60) : 0;
            $usedMinutesSinceActivation = $now->diffInMinutes($this->activation_time);
            $totalUsedMinutes = $this->used_time + $usedMinutesSinceActivation;

            if ($totalUsedMinutes >= $servicePlanDurationMinutes) {
                $this->expire();
                return false;
            }
        }

        return true;
    }

    /**
     * Add a device to the voucher.
     */
    public function addDevice($deviceId, $deviceInfo = []): ?DeviceSession
    {
        // Check if voucher is valid
        if (!$this->isValid()) {
            return null;
        }

        // Check if max devices reached
        if ($this->active_devices >= $this->allowed_devices) {
            return null;
        }

        // Check if device already exists
        $existingDevice = $this->deviceSessions()
            ->where('device_id', $deviceId)
            ->first();

        if ($existingDevice) {
            if (!$existingDevice->is_connected) {
                $existingDevice->update([
                    'is_connected' => true,
                    'connected_at' => now(),
                    'disconnected_at' => null,
                    'ip_address' => $deviceInfo['ip_address'] ?? null,
                    'device_name' => $deviceInfo['device_name'] ?? null,
                    'mac_address' => $deviceInfo['mac_address'] ?? null,
                ]);

                $this->increment('active_devices');
            }

            return $existingDevice;
        }

        // Create new device session
        $deviceSession = $this->deviceSessions()->create([
            'device_id' => $deviceId,
            'is_connected' => true,
            'connected_at' => now(),
            'ip_address' => $deviceInfo['ip_address'] ?? null,
            'device_name' => $deviceInfo['device_name'] ?? null,
            'mac_address' => $deviceInfo['mac_address'] ?? null,
        ]);

        $this->increment('active_devices');

        return $deviceSession;
    }

    /**
     * Remove a device from the voucher.
     */
    public function removeDevice($deviceId): bool
    {
        $deviceSession = $this->deviceSessions()
            ->where('device_id', $deviceId)
            ->where('is_connected', true)
            ->first();

        if (!$deviceSession) {
            return false;
        }

        $deviceSession->update([
            'is_connected' => false,
            'disconnected_at' => now(),
        ]);

        $this->decrement('active_devices');

        // If no more active devices, pause the voucher
        if ($this->active_devices <= 0 && $this->status === 'active') {
            $this->pause();
        }

        return true;
    }

    /**
     * Calculate the remaining time for this voucher in minutes.
     */
    public function getRemainingTimeInMinutes(): int
    {
        // Get total duration in minutes from service plan
        $servicePlanDurationMinutes = $this->servicePlan ? ($this->servicePlan->duration_hours * 60) : 0;


        // Calculate used time so far
        $totalUsedMinutes = $this->used_time;

        // If voucher is active, add the time since activation
        if ($this->status === 'active' && $this->activation_time) {
            $now = now();
            $usedMinutesSinceActivation = $this->activation_time->diffInMinutes($now);
            $totalUsedMinutes += $usedMinutesSinceActivation;
        }

        // Calculate remaining time based on status
        if ($this->status === 'unused') {
            // Unused voucher - full duration is remaining
            return $servicePlanDurationMinutes;
        } elseif ($this->status === 'expired') {
            // Expired voucher - no time remaining
            return 0;
        } else {
            // Active or paused voucher
            // dump(max(0, $servicePlanDurationMinutes - $totalUsedMinutes));
            return max(0, $servicePlanDurationMinutes - $totalUsedMinutes);
        }
    }
}
