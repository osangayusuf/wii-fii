<?php

use App\Models\User;
use App\Models\Voucher;
use App\Models\ServicePlan;
use App\Models\DeviceSession;

it('lists all device sessions for admin users only', function () {
    // Arrange
    $admin = User::factory()->create(['is_admin' => true]);
    $regularUser = User::factory()->create(['is_admin' => false]);
    $plan = ServicePlan::factory()->create();

    // Create vouchers for multiple users
    $voucher1 = Voucher::factory()->create([
        'user_id' => $regularUser->id,
        'service_plan_id' => $plan->id
    ]);

    $voucher2 = Voucher::factory()->create([
        'user_id' => User::factory()->create()->id,
        'service_plan_id' => $plan->id
    ]);

    // Create device sessions for each voucher
    DeviceSession::factory()->count(2)->create([
        'voucher_id' => $voucher1->id
    ]);

    DeviceSession::factory()->count(3)->create([
        'voucher_id' => $voucher2->id
    ]);

    // Act - Admin access
    $adminResponse = $this->actingAs($admin)
        ->getJson($this->apiBaseUrl . '/devices');

    // Assert - Admin can see all sessions
    $adminResponse->assertOk();
    $adminResponse->assertJsonCount(5, 'data');

    // Act - Regular user access (should be denied)
    $userResponse = $this->actingAs($regularUser)
        ->getJson($this->apiBaseUrl . '/devices');

    // Assert - Regular user cannot access all sessions
    $userResponse->assertForbidden();
});

it('allows regular users to access their voucher-specific sessions', function () {
    // Arrange
    $user = User::factory()->create(['is_admin' => false]);
    $plan = ServicePlan::factory()->create();

    // Create voucher for the user
    $voucher = Voucher::factory()->create([
        'user_id' => $user->id,
        'service_plan_id' => $plan->id
    ]);

    // Create device sessions
    $sessions = DeviceSession::factory()->count(2)->create([
        'voucher_id' => $voucher->id
    ]);

    // Act
    $response = $this->actingAs($user)
        ->getJson($this->apiBaseUrl . '/devices/voucher/' . $voucher->id);

    // Assert
    $response->assertOk();
    $response->assertJsonCount(2, 'data');
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'device_id',
                'ip_address',
                'mac_address',
                'device_name',
                'connected_at',
                'disconnected_at',
                'is_connected',
            ]
        ]
    ]);
});

it('prevents regular users from accessing other users voucher sessions', function () {
    // Arrange
    $user1 = User::factory()->create(['is_admin' => false]);
    $user2 = User::factory()->create(['is_admin' => false]);
    $plan = ServicePlan::factory()->create();

    // Create vouchers for each user
    $voucher1 = Voucher::factory()->create([
        'user_id' => $user1->id,
        'service_plan_id' => $plan->id
    ]);

    $voucher2 = Voucher::factory()->create([
        'user_id' => $user2->id,
        'service_plan_id' => $plan->id
    ]);

    // Create device sessions
    DeviceSession::factory()->create([
        'voucher_id' => $voucher1->id
    ]);

    DeviceSession::factory()->create([
        'voucher_id' => $voucher2->id
    ]);

    // Act - user1 tries to access user2's voucher sessions
    $response = $this->actingAs($user1)
        ->getJson($this->apiBaseUrl . '/devices/voucher/' . $voucher2->id);

    // Assert
    $response->assertForbidden();
});

it('allows regular users to access specific device session details', function () {
    // Arrange
    $user = User::factory()->create(['is_admin' => false]);
    $plan = ServicePlan::factory()->create();

    // Create voucher for the user
    $voucher = Voucher::factory()->create([
        'user_id' => $user->id,
        'service_plan_id' => $plan->id
    ]);

    // Create device session
    $session = DeviceSession::factory()->create([
        'voucher_id' => $voucher->id,
        'mac_address' => 'AA:BB:CC:DD:EE:FF',
        'is_connected' => true
    ]);

    // Act
    $response = $this->actingAs($user)
        ->getJson($this->apiBaseUrl . '/devices/' . $session->id);

    // Assert
    $response->assertOk();
    $response->assertJson([
        'data' => [
            'id' => $session->id,
            'mac_address' => 'AA:BB:CC:DD:EE:FF',
            'is_connected' => true
        ]
    ]);
});

it('prevents regular users from accessing other users device session details', function () {
    // Arrange
    $user1 = User::factory()->create(['is_admin' => false]);
    $user2 = User::factory()->create(['is_admin' => false]);
    $plan = ServicePlan::factory()->create();

    // Create vouchers for each user
    $voucher1 = Voucher::factory()->create([
        'user_id' => $user1->id,
        'service_plan_id' => $plan->id
    ]);

    $voucher2 = Voucher::factory()->create([
        'user_id' => $user2->id,
        'service_plan_id' => $plan->id
    ]);

    // Create device sessions
    $session1 = DeviceSession::factory()->create([
        'voucher_id' => $voucher1->id
    ]);

    $session2 = DeviceSession::factory()->create([
        'voucher_id' => $voucher2->id
    ]);

    // Act - user1 tries to access user2's session
    $response = $this->actingAs($user1)
        ->getJson($this->apiBaseUrl . '/devices/' . $session2->id);

    // Assert
    $response->assertForbidden();
});

it('requires authentication to access device sessions', function () {
    // Act
    $response1 = $this->getJson($this->apiBaseUrl . '/devices');
    $response2 = $this->getJson($this->apiBaseUrl . '/devices/1');
    $response3 = $this->getJson($this->apiBaseUrl . '/devices/voucher/1');

    // Assert
    $response1->assertUnauthorized();
    $response2->assertUnauthorized();
    $response3->assertUnauthorized();
});
