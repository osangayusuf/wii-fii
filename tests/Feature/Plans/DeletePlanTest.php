<?php

use App\Models\User;

it('allows admin user to delete plan', function () {
    $user = User::factory()->create(['is_admin' => true]);
    $token = $user->createToken('auth_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->delete($this->apiBaseUrl . '/plans/2');

    $response->assertOk()
        ->assertJson(
            [
                'plan' => ['is_active' => false],
                'message' => 'Service plan deactivated successfully'
            ]
        );
});

it('fails to delete plan if user is not admin', function() {
    $user = User::factory()->create(['is_admin' => false]);
    $token = $user->createToken('auth_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->delete($this->apiBaseUrl . '/plans/2');

    $response->assertForbidden()
        ->assertJson(
            [
                'message' => 'Unauthorized'
            ]
        );
});
