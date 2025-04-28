<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceSession extends Model
{
    protected $fillable = [
        'voucher_id',
        'device_id',
        'ip_address',
        'mac_address',
        'device_name',
        'connected_at',
        'disconnected_at',
        'is_connected',
    ];

    protected $casts = [
        'connected_at' => 'datetime',
        'disconnected_at' => 'datetime',
        'is_connected' => 'boolean',
    ];

    /**
     * Get the voucher that owns the device session.
     */
    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    /**
     * Connect the device.
     */
    public function connect(): bool
    {
        if ($this->is_connected) {
            return true; // Already connected
        }

        $this->is_connected = true;
        $this->connected_at = now();
        $this->disconnected_at = null;

        $success = $this->save();

        if ($success) {
            // Activate the voucher if it's not already active
            $voucher = $this->voucher;
            if ($voucher->status !== 'active') {
                $voucher->activate();
            }
        }

        return $success;
    }

    /**
     * Disconnect the device.
     */
    public function disconnect(): bool
    {
        if (!$this->is_connected) {
            return true; // Already disconnected
        }

        $this->is_connected = false;
        $this->disconnected_at = now();

        return $this->save();
    }
}
