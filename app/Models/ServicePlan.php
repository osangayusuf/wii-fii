<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServicePlan extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_hours',
        'max_devices',
        'bandwidth_limit_mbps',
        'data_limit_mb',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_hours' => 'integer',
        'max_devices' => 'integer',
        'bandwidth_limit_mbps' => 'integer',
        'data_limit_mb' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the vouchers for the service plan.
     */
    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class);
    }

    /**
     * Scope a query to only include active service plans.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
