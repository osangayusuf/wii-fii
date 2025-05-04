<?php

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;

it('initializes Paystack funding process', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 0
    ]);

    $fundingData = [
        'amount' => 5000.00,  // Amount in Naira * 100 (5000 = ₦50.00)
        'email' => $user->email
    ];

    // Mock Paystack API response
    Http::fake([
        'https://api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'message' => 'Authorization URL created',
            'data' => [
                'authorization_url' => 'https://checkout.paystack.com/test_authorization_url',
                'access_code' => 'test_access_code',
                'reference' => 'test_reference'
            ]
        ], 200)
    ]);

    // Act
    $response = $this->actingAs($user)
        ->postJson($this->apiBaseUrl . '/wallet/' . $wallet->id . '/fund', $fundingData);

    // Assert
    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'message',
            'transaction',
            'payment_url',
            'reference'
        ])
        ->assertJson([
            'status' => 'success',
            'message' => 'Payment initiated',
            'transaction' => [
                'amount' => "5000.00",
            ],
            'payment_url' => 'https://checkout.paystack.com/test_authorization_url'
        ]);

    // Verify transaction was recorded in pending state
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'amount' => $fundingData['amount'],
        'type' => 'deposit',
        'status' => 'pending',
    ]);
});

it('verifies successful Paystack payment and updates wallet balance', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 1000
    ]);

    // Create a pending transaction
    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'amount' => 5000,
        'type' => 'deposit',
        'status' => 'pending',
        'reference' => 'test_successful_reference',
        'metadata' => [
            'reference' => 'test_successful_reference',
        ]
    ]);

    // Mock Paystack verification API response
    Http::fake([
        'https://api.paystack.co/transaction/verify/' . $transaction->reference => Http::response([
            'status' => true,
            'message' => 'Verification successful',
            'data' => [
                'status' => 'success',
                'amount' => 5000,
                'reference' => $transaction->reference,
                'id' => 1,
                'channel' => 'card',
                'paid_at' => now(),
            ]
        ], 200)
    ]);

    // Act
    $response = $this->getJson($this->apiBaseUrl . '/wallet/verify-funding?reference=test_successful_reference');

    // Assert
    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
        'message' => 'Payment verified successfully'
    ]);

    // Verify transaction status updated
    $this->assertDatabaseHas('transactions', [
        'id' => $transaction->id,
        'status' => 'completed'
    ]);

    // Verify wallet balance updated
    $this->assertEquals(6000, $wallet->fresh()->balance);
});

it('handles failed Paystack payments properly', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 1000
    ]);

    // Create a pending transaction
    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'amount' => 5000,
        'type' => 'deposit',
        'status' => 'pending',
        'reference' => 'test_failed_reference',
        'metadata' => [
            'reference' => 'test_failed_reference',
        ]
    ]);

    // Mock Paystack verification API response for failed payment
    Http::fake([
        'https://api.paystack.co/transaction/verify/test_failed_reference' => Http::response([
            'status' => true,
            'message' => 'Verification successful',
            'data' => [
                'status' => 'failed',
                'amount' => 5000,
                'reference' => $transaction->reference,
                'id' => 1,
                'channel' => 'card',
                'paid_at' => null,
                'gateway_response' => 'Payment failed or was cancelled',
            ]
        ], 200)
    ]);

    // Act
    $response = $this->getJson($this->apiBaseUrl . '/wallet/verify-funding?reference=test_failed_reference');

    // Assert
    $response->assertStatus(400);
    $response->assertJson([
        'status' => 'failed',
        'message' => 'Payment verification failed'
    ]);

    // Verify transaction status updated to failed
    $this->assertDatabaseHas('transactions', [
        'id' => $transaction->id,
        'status' => 'failed'
    ]);

    // Verify wallet balance unchanged
    $this->assertEquals(1000, $wallet->fresh()->balance);
});

it('prevents funding another user wallet', function () {
    // Arrange
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $wallet1 = Wallet::factory()->create([
        'user_id' => $user1->id,
        'balance' => 1000
    ]);

    $wallet2 = Wallet::factory()->create([
        'user_id' => $user2->id,
        'balance' => 2000
    ]);

    $fundingData = [
        'amount' => 3000,
        'email' => $user1->email
    ];

    // Act
    $response = $this->actingAs($user1)
        ->postJson($this->apiBaseUrl . '/wallet/' . $wallet2->id . '/fund', $fundingData);

    // Assert
    $response->assertForbidden();
});
