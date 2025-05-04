<?php

use App\Models\User;
use App\Models\Voucher;
use App\Models\ServicePlan;
use App\Models\DeviceSession;

it('authenticates device with valid unused voucher code', function () {
    // Arrange
    $user = User::factory()->create();
    $plan = ServicePlan::factory()->create([
        'duration_hours' => 24,
        'data_limit_mb' => 5000,
        'max_devices' => 2
    ]);

    $voucher = Voucher::factory()->create([
        'user_id' => $user->id,
        'service_plan_id' => $plan->id,
        'status' => 'unused',
        'code' => 'VALID-CODE-1234'
    ]);

    $deviceData = [
        'voucher_code' => 'VALID-CODE-1234',
        'device_id' => 'device1',
    ];

    // Act
    $response = $this->postJson($this->apiBaseUrl . '/hotspot/authenticate', $deviceData);


    // Assert
    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
        'message' => 'Device authenticated successfully',

    ]);
    $response->assertJsonStructure(
        [
            'status',
            'message',
            'voucher',
            'device_session',
            'remaining_minutes',
        ]
    );

    // Check voucher status updated
    $this->assertDatabaseHas('vouchers', [
        'id' => $voucher->id,
        'status' => 'active'
    ]);

    // Check device session created
    $this->assertDatabaseHas('device_sessions', [
        'voucher_id' => $voucher->id,
        'device_id' => $deviceData['device_id'],
        'mac_address' => null,
        'is_connected' => true,
    ]);
});

it('rejects authentication with invalid voucher code', function () {
    // Arrange
    $deviceData = [
        'voucher_code' => 'INVALID-CODE-9999',
        'device_id' => 'device1',
    ];

    // Act
    $response = $this->postJson($this->apiBaseUrl . '/hotspot/authenticate', $deviceData);

    // Assert
    $response->assertNotFound();
    $response->assertJson([
        'status' => 'error',
        'message' => 'Invalid voucher code'
    ]);
});

it('rejects authentication with already used voucher', function () {
    // Arrange
    $user = User::factory()->create();
    $plan = ServicePlan::factory()->create();

    $voucher = Voucher::factory()->create([
        'user_id' => $user->id,
        'service_plan_id' => $plan->id,
        'status' => 'expired',
        'code' => 'USED-CODE-5678'
    ]);

    $deviceData = [
        'voucher_code' => 'USED-CODE-5678',
        'device_id' => 'device1'
    ];

    // Act
    $response = $this->postJson($this->apiBaseUrl . '/hotspot/authenticate', $deviceData);

    // Assert
    $response->assertBadRequest();
    $response->assertJson([
        'status' => 'expired',
        'message' => 'This voucher has expired'
    ]);
});

it('rejects new device when max devices limit is reached', function () {
    // Arrange
    $user = User::factory()->create();
    $plan = ServicePlan::factory()->create([
        'max_devices' => 1
    ]);

    $voucher = Voucher::factory()->create([
        'user_id' => $user->id,
        'service_plan_id' => $plan->id,
        'status' => 'active',
        'code' => 'LIMITED-CODE-1111'
    ]);

    // Create an existing active session
    DeviceSession::factory()->create([
        'voucher_id' => $voucher->id,
        'mac_address' => 'AA:BB:CC:DD:EE:FF',
        'is_connected' => 'true'
    ]);

    $deviceData = [
        'voucher_code' => 'LIMITED-CODE-1111',
        'device_id' => 'device1',
    ];

    // Act
    $response = $this->postJson($this->apiBaseUrl . '/hotspot/authenticate', $deviceData);

    // Assert
    $response->assertInternalServerError();
    $response->assertJson([
        'status' => 'error',
        'message' => 'Failed to authenticate device',
    ]);
});
