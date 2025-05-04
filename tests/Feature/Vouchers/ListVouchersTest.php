<?php

use App\Models\User;
use App\Models\Voucher;
use App\Models\ServicePlan;

it('lists all vouchers for authenticated user', function () {
    // Arrange
    $user = User::factory()->create();
    $plan = ServicePlan::factory()->create();

    $vouchers = Voucher::factory()->count(3)->create([
        'user_id' => $user->id,
        'service_plan_id' => $plan->id
    ]);

    // Act
    $response = $this->actingAs($user)
        ->getJson($this->apiBaseUrl . '/vouchers');

    // Assert
    $response->assertOk();
    $response->assertJsonCount(3, 'data');
    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'code',
                'status',
                'is_active',
                'activation_time',
                'active_devices',
                'allowed_devices',
                'used_time',
                'service_plan',
            ]
        ]
    ]);
});

it('does not show vouchers belonging to other users', function () {
    // Arrange
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $plan = ServicePlan::factory()->create();

    // Create vouchers for both users
    Voucher::factory()->count(3)->create([
        'user_id' => $user1->id,
        'service_plan_id' => $plan->id
    ]);

    Voucher::factory()->count(2)->create([
        'user_id' => $user2->id,
        'service_plan_id' => $plan->id
    ]);

    // Act - user1 requests their vouchers
    $response = $this->actingAs($user1)
        ->getJson($this->apiBaseUrl . '/vouchers');

    // Assert - only user1's vouchers are returned
    $response->assertOk();
    $response->assertJsonCount(3, 'data');

    // Get the IDs from the response
    $returnedIds = collect($response->json('data'))->pluck('id')->toArray();

    // Get the IDs of user1's vouchers from the database
    $user1VoucherIds = Voucher::where('user_id', $user1->id)->pluck('id')->toArray();

    // Check that all returned vouchers belong to user1
    foreach ($returnedIds as $id) {
        $this->assertContains($id, $user1VoucherIds);
    }
});

it('returns empty array when user has no vouchers', function () {
    // Arrange
    $user = User::factory()->create();

    // Act
    $response = $this->actingAs($user)
        ->getJson($this->apiBaseUrl . '/vouchers');

    // Assert
    $response->assertOk();
    $response->assertJsonCount(0, 'data');
    $response->assertJson([
        'data' => []
    ]);
});

it('requires authentication to list vouchers', function () {
    // Act
    $response = $this->getJson($this->apiBaseUrl . '/vouchers');

    // Assert
    $response->assertUnauthorized();
});
