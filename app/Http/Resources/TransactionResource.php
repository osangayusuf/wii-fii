<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            'wallet_id' => $this->wallet_id,
            'amount' => $this->amount,
            'type' => $this->type,
            'description' => $this->description,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Include relationships if loaded
            'user' => new UserResource($this->whenLoaded('user')),
            'wallet' => new WalletResource($this->whenLoaded('wallet')),
        ];
    }
}
