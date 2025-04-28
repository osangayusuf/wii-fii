<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceSessionResource extends JsonResource
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
            'device_id' => $this->device_id,
            'is_connected' => $this->is_connected,
            'connected_at' => $this->connected_at,
            'disconnected_at' => $this->disconnected_at,
            'ip_address' => $this->ip_address,
            'mac_address' => $this->mac_address,
            'device_name' => $this->device_name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Include relationships if loaded
            'voucher' => new VoucherResource($this->whenLoaded('voucher')),
            // Add computed attributes
            'connection_duration' => $this->when($this->connected_at, function () {
                $end = $this->is_connected ? now() : ($this->disconnected_at ?? now());
                return $this->connected_at->diffInMinutes($end);
            }),
        ];
    }
}
