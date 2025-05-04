<?php

use App\Models\User;

it('returns the authenticated user profile with wallet and vouchers', function () {
    $user = User::factory()->hasWallet()->hasVouchers(3)->create();
    $this->actingAs($user);

    $response = $this->getJson($this->apiBaseUrl . '/auth/profile');

    $response->assertOk()
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'wallet' => [
                    'id',
                    'balance',
                ],
                'vouchers' => [
                    '*' => [
                        'id',
                        'user_id',
                        'code',
                        'status',
                        'is_active',
                        'activation_time',
                        'active_devices',
                        'allowed_devices',
                        'used_time',
                        'is_valid',
                        'remaining_hours'
                    ],
                ]
            ],
        ]);
});

it(
    'returns the authenticated user profile without a wallet',
    function () {
        $user = User::factory()->hasVouchers(1)->create();
        $this->actingAs($user);
        $response = $this->getJson($this->apiBaseUrl . '/auth/profile');

        $response->assertOk()
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'wallet',
                    'vouchers' => [
                        '*' => [
                            'id',
                            'user_id',
                            'code',
                            'status',
                            'is_active',
                            'activation_time',
                            'active_devices',
                            'allowed_devices',
                            'used_time',
                            'is_valid',
                            'remaining_hours'
                        ],
                    ]
                ]
            ])
            ->assertJson(['user' => ['wallet' => null]]);
    }
);

it('returns the authenticated user profile without any vouchers', function () {
    $user = User::factory()->hasWallet()->create();
    $this->actingAs($user);
    $response = $this->getJson($this->apiBaseUrl . '/auth/profile');

    $response->assertOk()
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'wallet' => [
                    'id',
                    'balance',
                ],
                'vouchers' => []
            ]
        ])
        ->assertJson(['user' => ['vouchers' => []]]);
});

it('returns the authenticated user profile without wallet and vouchers', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    $response = $this->getJson($this->apiBaseUrl . '/auth/profile');

    $response->assertOk()
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'wallet',
                'vouchers'
            ]
        ])
        ->assertJson(['user' => ['wallet' => null, 'vouchers' => []]]);
});

it('returns 401 when not authenticated', function () {
    $response = $this->getJson($this->apiBaseUrl . '/auth/profile');

    $response->assertUnauthorized();
});
