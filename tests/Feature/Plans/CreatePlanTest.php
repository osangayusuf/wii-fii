<?php

use App\Models\User;

it('allows admin to create a new service plan', function () {
    // Arrange
    $admin = User::factory()->create(['is_admin' => true]);

    $planData = [
        'name' => 'Premium Plan',
        'description' => 'High-speed connection for power users',
        'price' => 2500,
        'duration_hours' => 72,
        'data_limit_mb' => 10000,
        'max_devices' => 3,
        'bandwidth_limit_mbps' => 10,
        'is_active' => true
    ];

    // Act
    $response = $this->actingAs($admin)
        ->postJson($this->apiBaseUrl . '/plans', $planData);

    // Assert
    $response->assertCreated();
    $response->assertJsonStructure([
        'data' => [
            'id',
            'name',
            'description',
            'price',
            'duration_hours',
            'data_limit_mb',
            'max_devices',
            'bandwidth_limit_mbps',
            'is_active',
            'created_at',
            'updated_at'
        ]
    ]);

    $this->assertDatabaseHas('service_plans', [
        'name' => 'Premium Plan',
        'price' => 2500,
        'duration_hours' => 72
    ]);
});

it('prevents non-admin users from creating service plans', function () {
    // Arrange
    $regularUser = User::factory()->create(['is_admin' => false]);

    $planData = [
        'name' => 'Unauthorized Plan',
        'description' => 'This plan should not be created',
        'price' => 1000,
        'duration_hours' => 24,
        'data_limit_mb' => 5000
    ];

    // Act
    $response = $this->actingAs($regularUser)
        ->postJson($this->apiBaseUrl . '/plans', $planData);

    // Assert
    $response->assertForbidden();

    $this->assertDatabaseMissing('service_plans', [
        'name' => 'Unauthorized Plan'
    ]);
});

it('validates required fields when creating a service plan', function () {
    // Arrange
    $admin = User::factory()->create(['is_admin' => true]);

    $planData = [
        'name' => '',
        'description' => 'Missing required fields',
        'price' => -100,
        'duration_hours' => 0
    ];

    // Act
    $response = $this->actingAs($admin)
        ->postJson($this->apiBaseUrl . '/plans', $planData);

    // Assert
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'price', 'duration_hours']);
});
