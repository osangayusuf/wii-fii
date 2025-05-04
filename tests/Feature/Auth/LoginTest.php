<?php

test('the user cannot log in with invalid credentials', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/login', [
        'email' => 'user@example.com',
        'password' => 'wrongpassword',
    ]);
    $response->assertUnprocessable();
});

describe('the user is valid', function () {


    test('the user can log in successfully', function () {
        $response = $this->postJson($this->apiBaseUrl . '/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);
        $response->assertOk();
    });

    test('the user gets the token after login', function () {
        $response = $this->postJson($this->apiBaseUrl . '/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);
        
        $response->assertOk();

        $this->assertArrayHasKey('token', $response->json());
    });

    test('the user details are returned after login', function () {
        $response = $this->postJson($this->apiBaseUrl . '/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'wallet' => [
                        'id',
                        'balance',
                    ],
                ],
                'token',
            ]);
    });
});
