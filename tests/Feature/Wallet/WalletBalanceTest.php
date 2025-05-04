<?php

use App\Models\User;
use App\Models\Wallet;

it('shows wallet balance for authenticated user', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'balance' => 5000
    ]);

    // Act
    $response = $this->actingAs($user)
        ->getJson($this->apiBaseUrl . '/wallet/' . $wallet->id);

    // Assert
    $response->assertOk();
    $response->assertJsonStructure([
        'data' => [
            'id',
            'balance',
            'created_at',
            'updated_at'
        ]
    ]);
    $response->assertJson([
        'data' => [
            'balance' => 5000
        ]
    ]);
});

it('prevents accessing wallet balance when unauthenticated', function () {
    // Act
    $response = $this->getJson($this->apiBaseUrl . '/wallet');

    // Assert
    $response->assertUnauthorized();
});

it('creates a wallet automatically for new users', function () {
    // Arrange
    $userData = [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123'
    ];

    // Act
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', $userData);

    // Assert
    $response->assertCreated();

    $user = User::where('email', 'newuser@example.com')->first()->load('wallet');
    $this->assertNotNull($user);

    // Verify wallet was created
    $this->assertDatabaseHas('wallets', [
        'user_id' => $user->id,
        'balance' => 0
    ]);
    // Verify we can see the wallet
    $this->actingAs($user)
        ->getJson($this->apiBaseUrl . '/wallet/' . $user->wallet->id)
        ->assertOk()
        ->assertJson([
            'data' => [
                'balance' => 0
            ]
        ]);
});

it('prevents accessing another user wallet', function () {
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

    // Act
    $response = $this->actingAs($user1)
        ->getJson($this->apiBaseUrl . '/wallet/' . $wallet2->id);

    // Assert
    $response->assertForbidden();
});
