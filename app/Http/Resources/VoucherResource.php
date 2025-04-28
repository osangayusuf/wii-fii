<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
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
            'user_id' => $this->user_id,
            'code' => $this->code,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'activation_time' => $this->activation_time,
            'active_devices' => $this->active_devices,
            'allowed_devices' => $this->allowed_devices,
            'used_time' => $this->used_time,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Include relationships if loaded
            'service_plan' => new ServicePlanResource($this->whenLoaded('servicePlan')),
            'device_sessions' => DeviceSessionResource::collection($this->whenLoaded('deviceSessions')),
            'user' => new UserResource($this->whenLoaded('user')),
            // Add some computed attributes
            'is_valid' => $this->when(true, function () {
                return $this->isValid();
            }),
            'remaining_hours' => $this->when(true, function () {
                // Use the new method to calculate remaining time
                return ceil($this->getRemainingTimeInMinutes() / 60); // Convert minutes to hours and round up
            }),
        ];
    }
}
