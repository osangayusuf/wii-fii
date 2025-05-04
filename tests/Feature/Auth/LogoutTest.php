<?php

use App\Models\User;

it('logs out user successfully', function () {
    $user = User::factory()->create();

    $token = $user->createToken('auth_token');
    $userToken = $token->plainTextToken;

    // Verify the token exists in the database using the token ID
    $tokenId = explode('|', $userToken)[0];
    $this->assertDatabaseHas('personal_access_tokens', [
        'id' => $tokenId,
        'tokenable_id' => $user->id
    ]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $userToken
    ])->post($this->apiBaseUrl . '/auth/logout');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Logout successful',
        ]);

    // Verify the token is deleted from database
    $this->assertDatabaseMissing('personal_access_tokens', [
        'id' => $tokenId,
        'tokenable_id' => $user->id
    ]);
});

it('fails to log out user with invalid token', function () {
    $invalidToken = 'invalid_token_123';

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $invalidToken
    ])->post($this->apiBaseUrl . '/auth/logout');

    $response->assertRedirectToRoute('login');
});
