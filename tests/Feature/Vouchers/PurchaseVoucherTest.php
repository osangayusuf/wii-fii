<?php

use App\Models\User;
use App\Models\Wallet;
use App\Models\ServicePlan;
use App\Models\Voucher;

it('allows user to purchase a voucher with sufficient funds', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 1000
    ]);
    $plan = ServicePlan::factory()->create([
        'price' => 500,
        'duration_hours' => 24,
        'data_limit_mb' => 5000,
        'is_active' => true
    ]);

    // Act
    $response = $this->actingAs($user)
        ->postJson($this->apiBaseUrl . '/vouchers/purchase', [
            'service_plan_id' => $plan->id
        ]);

    // Assert
    $response->assertOk();
    $response->assertJsonStructure([
        'message',
        'voucher' => [
            'id',
            'code',
            'status',
            'is_active',
            'activation_time',
            'active_devices',
            'allowed_devices',
            'used_time',
            'service_plan'
        ],
        'transaction'
    ]);

    // Check wallet was debited
    $this->assertEquals(500, $wallet->fresh()->balance);

    // Check voucher was created
    $this->assertDatabaseHas('vouchers', [
        'user_id' => $user->id,
        'service_plan_id' => $plan->id,
        'status' => 'unused'
    ]);

    // Check transaction was recorded
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'amount' => 500,
        'type' => 'purchase'
    ]);
});

it('prevents voucher purchase with insufficient funds', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 200
    ]);
    $plan = ServicePlan::factory()->create([
        'price' => 500,
        'is_active' => true
    ]);

    // Act
    $response = $this->actingAs($user)
        ->postJson($this->apiBaseUrl . '/vouchers/purchase', [
            'service_plan_id' => $plan->id
        ]);

    // Assert
    $response->assertBadRequest();
    $response->assertJson([
        'message' => 'Insufficient funds in wallet',
        'required' => $plan->price,
        'available' => $wallet->balance,
    ]);

    // Verify wallet balance is unchanged
    $this->assertEquals(200, $wallet->fresh()->balance);

    // Verify no voucher was created
    $this->assertDatabaseMissing('vouchers', [
        'user_id' => $user->id,
        'service_plan_id' => $plan->id
    ]);
});

it('prevents purchase of inactive service plans', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 1000
    ]);
    $plan = ServicePlan::factory()->create([
        'price' => 500,
        'is_active' => false
    ]);

    // Act
    $response = $this->actingAs($user)
        ->postJson($this->apiBaseUrl . '/vouchers/purchase', [
            'service_plan_id' => $plan->id
        ]);

    // Assert
    $response->assertBadRequest();

    // Verify wallet balance is unchanged
    $this->assertEquals(1000, $wallet->fresh()->balance);
});

it('requires authentication for voucher purchase', function () {
    // Arrange
    $plan = ServicePlan::factory()->create();

    // Act
    $response = $this->postJson($this->apiBaseUrl . '/vouchers/purchase', [
        'service_plan_id' => $plan->id
    ]);

    // Assert
    $response->assertUnauthorized();
});
