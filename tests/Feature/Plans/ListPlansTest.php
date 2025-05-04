<?php

use App\Models\ServicePlan;
use App\Models\User;

it('lists all active plans successfully', function () {
    $response = $this->get($this->apiBaseUrl . '/plans');

    $response->assertOk()->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'name',
                'description',
                'price',
                'duration_hours',
                'max_devices',
                'bandwidth_limit_mbps',
                'data_limit_mb',
                'is_active',
            ],
        ],
    ]);
});

it('lists all plans both active and inactive if user is admin', function () {
    $user = User::factory()->create(['is_admin' => true]);
    $token = $user->createToken('auth_token')->plainTextToken;
    $plan = ServicePlan::factory()->create(['is_active' => false]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->get($this->apiBaseUrl . '/plans/all');

    $response->assertOk()->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'name',
                'description',
                'price',
                'duration_hours',
                'max_devices',
                'bandwidth_limit_mbps',
                'data_limit_mb',
                'is_active',
            ],
        ],
    ]);
    $this->assertDatabaseCount('service_plans', 5);
});

it('fails to list all plans if user is not admin', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $token = $user->createToken('auth_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->get($this->apiBaseUrl . '/plans/all');

    $response->assertForbidden();
});

it('gets a single service plan using its id', function () {
    $response = $this->get($this->apiBaseUrl . '/plans/1');

    $response->assertOk()->assertJsonStructure([
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
        ],
    ])->assertJson([
        'data' => [
            'id' => 1,
            'name' => 'Basic - 1 Hour',
        ]
    ]);
});

it('can list all available plans without authentication', function () {

    // Act
    $response = $this->getJson($this->apiBaseUrl . '/plans');

    // Assert
    $response->assertOk();
    $response->assertJsonCount(4, 'data');
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'name',
                'description',
                'price',
                'duration_hours',
                'data_limit_mb',
                'created_at',
                'updated_at'
            ]
        ]
    ]);
});

it('includes a specific plan in the listing', function () {
    // Arrange
    ServicePlan::factory()->count(2)->create();
    $specificPlan = ServicePlan::factory()->create([
        'name' => 'Special Plan',
        'price' => 1000,
        'duration_hours' => 24,
        'data_limit_mb' => 5000,
        'is_active' => true
    ]);

    // Act
    $response = $this->getJson($this->apiBaseUrl . '/plans');
    // Assert
    $response->assertOk();
    $response->assertJsonFragment([
        'name' => 'Special Plan',
        'price' => '1000.00',
        'duration_hours' => 24,
        'data_limit_mb' => 5000
    ]);
});

it('can access extended plan information when authenticated as admin', function () {
    // Arrange
    $user = User::factory()->create([
        'is_admin' => true
    ]);
    $plans = ServicePlan::factory()->count(3)->create([
        'is_active' => false
    ]);

    // Act
    $response = $this->actingAs($user)
        ->getJson($this->apiBaseUrl . '/plans/all');

    // Assert
    $response->assertOk();
    $response->assertJsonCount(7, 'data');
    $response->assertJsonStructure([
        'data' => [
            '*' => [
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
    ]);
});
