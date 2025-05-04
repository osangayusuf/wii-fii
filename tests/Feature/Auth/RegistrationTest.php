<?php

test('user can register', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', [
        'name' => 'Osanga',
        'email' => 'osanga@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertCreated();
});

test('user cannot register with existing email', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['email']);
});

test('user cannot register with invalid email', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', [
        'name' => 'Test User',
        'email' => 'invalid-email',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['email']);
});

test('user cannot register with short password', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', [
        'name' => 'Test User',
        'email' => 'new.user@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);
    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['password']);
});

test('user cannot register with mismatched password confirmation', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', [
        'name' => 'Test User',
        'email' => 'new.user@example.com',
        'password' => 'password',
        'password_confirmation' => 'differentpassword',
    ]);
    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['password']);
});

test('user cannot register without required fields', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', []);
    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name', 'email', 'password']);
});

test('user registration returns user details and token', function () {
    $response = $this->postJson($this->apiBaseUrl . '/auth/register', [
        'name' => 'Test User',
        'email' => 'new.user@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    $response->assertCreated(201);
    $response->assertJsonStructure([
        'message',
        'user' => [
            'id',
            'name',
            'email',
            'wallet' => [
                'id',
                'balance',
            ],
            'vouchers' => []
        ],
        'token',
    ]);
});
