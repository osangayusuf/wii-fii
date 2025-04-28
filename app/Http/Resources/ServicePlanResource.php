<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicePlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'duration_hours' => $this->duration_hours,
            'max_devices' => $this->max_devices,
            'bandwidth_limit_mbps' => $this->bandwidth_limit_mbps,
            'data_limit_mb' => $this->data_limit_mb,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Include vouchers if loaded
            'vouchers' => VoucherResource::collection($this->whenLoaded('vouchers')),
        ];
    }
}
