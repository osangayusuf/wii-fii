<?php

use App\Models\User;

it('allows admin user to update plan details', function () {
    $user = User::factory()->create(['is_admin' => true]);
    $token = $user->createToken('auth_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->putJson($this->apiBaseUrl . '/plans/2', [
        'name' => 'Updated Plan',
        'description' => 'updated Plan Description',
        'price' => 2000,
        'duration_hours' => 10,
        'max_devices' => 2,
        'bandwidth_limit_mbps' => 15,
        'data_limit_mb' => 2000,
        'is_active' => true,
    ]);

    $response->assertOk()
        ->assertJsonStructure(
            [
                'data' => [
                    'id',
                    'name',
                    'description',
                    'price',
                    'duration_hours',
                    'max_devices',
                    'bandwidth_limit_mbps',
                    'data_limit_mb',
                    'is_active',
                ]
            ]
        );
});

it('fails to update plan if user is not admin', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $token = $user->createToken('auth_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->putJson($this->apiBaseUrl . '/plans/2', [
        'name' => 'Updated Plan',
        'description' => 'updated Plan Description',
        'price' => 2000,
        'duration_hours' => 10,
        'max_devices' => 2,
        'bandwidth_limit_mbps' => 15,
        'data_limit_mb' => 2000,
        'is_active' => true,
    ]);

    $response->assertForbidden()
        ->assertJson(['message' => 'Unauthorized']);
});
