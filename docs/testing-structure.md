# Suggested Test Structure for Wii-Fii Project

Your Wii-Fii project would benefit from a comprehensive testing strategy that covers all key components. Based on your current project structure, here's a recommended organization for your test suite:

## Test Organization

```
tests/
├── Feature/                  # Feature tests for end-to-end functionality
│   ├── Auth/                 # Authentication-related tests
│   │   ├── LoginTest.php     # (existing) Tests for user login
│   │   ├── LogoutTest.php    # Tests for user logout functionality
│   │   ├── ProfileTest.php   # (existing) Tests for user profile
│   │   └── RegistrationTest.php # (existing) Tests for user registration
│   │
│   ├── Plans/                # Tests for service plan functionality
│   │   ├── ListPlansTest.php # Tests for listing service plans
│   │   ├── CreatePlanTest.php # Admin tests for creating plans
│   │   ├── UpdatePlanTest.php # Admin tests for updating plans
│   │   └── DeletePlanTest.php # Admin tests for deleting plans
│   │
│   ├── Wallet/               # Tests for wallet functionality
│   │   ├── WalletBalanceTest.php # Tests for checking wallet balance
│   │   ├── WalletFundingTest.php # Tests for adding funds
│   │   ├── PaystackWebhookTest.php # Tests for Paystack webhook handling
│   │   └── TransactionHistoryTest.php # Tests for transaction history
│   │
│   ├── Vouchers/             # Tests for voucher functionality
│   │   ├── PurchaseVoucherTest.php # Tests for voucher purchase
│   │   ├── ListVouchersTest.php # Tests for listing user's vouchers
│   │   ├── VoucherDetailsTest.php # Tests for viewing voucher details
│   │   └── VoucherActivationTest.php # Tests for activating vouchers
│   │
│   ├── Hotspot/              # Tests for hotspot connectivity
│   │   ├── AuthenticateTest.php # Tests for hotspot authentication
│   │   ├── DisconnectTest.php # Tests for disconnecting from hotspot
│   │   └── StatusCheckTest.php # Tests for checking connection status
│   │
│   └── DeviceSessions/       # Tests for device session management
│       ├── ListSessionsTest.php # Tests for listing device sessions
│       ├── SessionDetailsTest.php # Tests for viewing session details
│       └── EndSessionTest.php # Tests for ending a session
│
├── Unit/                     # Unit tests for individual components
│   ├── Models/               # Tests for model methods and relationships
│   │   ├── UserTest.php      # Tests for User model
│   │   ├── WalletTest.php    # Tests for Wallet model
│   │   ├── VoucherTest.php   # Tests for Voucher model
│   │   ├── ServicePlanTest.php # Tests for ServicePlan model
│   │   ├── TransactionTest.php # Tests for Transaction model
│   │   └── DeviceSessionTest.php # Tests for DeviceSession model
│   │
│   ├── Services/             # If you have service classes
│   │   ├── VoucherServiceTest.php # Tests for voucher-related services
│   │   ├── PaymentServiceTest.php # Tests for payment processing
│   │   └── HotspotServiceTest.php # Tests for hotspot management
│   │
│   └── Helpers/              # If you have helper functions
│
├── Integration/              # Integration tests for connected components
│   ├── WalletVoucherIntegrationTest.php # Testing wallet and voucher interaction
│   └── VoucherSessionIntegrationTest.php # Testing vouchers and sessions
│
├── Pest.php                  # (existing) Pest configuration file
└── TestCase.php              # (existing) Base test case class
```

## Testing Strategy by Component

### Authentication Tests

-   Test user registration with valid/invalid data
-   Test login with correct/incorrect credentials
-   Test profile viewing and updating
-   Test authorization and permissions

### Service Plan Tests

-   Test listing available plans (public)
-   Test plan CRUD operations (admin only)
-   Test plan activation/deactivation

### Wallet Tests

-   Test wallet creation during user registration
-   Test adding funds with Paystack
-   Test wallet balance updates
-   Test transaction recording

### Voucher Tests

-   Test purchasing vouchers with wallet balance
-   Test voucher code generation
-   Test voucher activation/deactivation
-   Test voucher status transitions

### Hotspot Authentication Tests

-   Test connecting with valid voucher code
-   Test connecting with invalid/expired voucher
-   Test disconnecting active session
-   Test session status checking

### Device Session Tests

-   Test session creation when connecting
-   Test device limits per voucher
-   Test simultaneous connections
-   Test session termination

## Test Data Strategy

1. **Database Factories**: Utilize your existing factories and extend them to create more complex test scenarios:

    ```php
    // Example of enhanced user factory with related data
    $user = User::factory()
        ->hasWallet(['balance' => 5000])
        ->hasVouchers(3, ['status' => 'unused'])
        ->create();
    ```

2. **Database Seeders**: Use your seeders for standard test data, such as service plans

3. **RefreshDatabase**: Continue using the RefreshDatabase trait to ensure tests run in isolation

## Advanced Testing Considerations

1. **Admin vs. Regular User Tests**: Create separate test cases for admin and regular user operations

2. **API Token Authentication**: Test both authenticated and unauthenticated routes

3. **Payment Integration Testing**: Mock Paystack API for predictable testing

4. **Time-dependent Features**: Use time manipulation for testing time-sensitive features like voucher expiration

5. **Error and Edge Cases**: Ensure coverage for validation errors, insufficient funds, expired sessions, etc.

## Implementation Example

Here's an example of how a simple voucher purchase test could look:

```php
<?php

use App\Models\User;
use App\Models\ServicePlan;

it('allows user to purchase a voucher with sufficient funds', function () {
    // Arrange
    $user = User::factory()->create();
    $wallet = $user->wallet()->create(['balance' => 1000]);
    $plan = ServicePlan::factory()->create(['price' => 500]);

    $this->actingAs($user);

    // Act
    $response = $this->postJson($this->apiBaseUrl . '/vouchers/purchase', [
        'service_plan_id' => $plan->id
    ]);

    // Assert
    $response->assertCreated();
    $response->assertJsonStructure([
        'message',
        'voucher' => [
            'id', 'code', 'status'
        ]
    ]);

    // Check wallet was debited
    $this->assertEquals(500, $wallet->fresh()->balance);

    // Check transaction was recorded
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'wallet_id' => $wallet->id,
        'amount' => 500,
        'type' => 'purchase'
    ]);
});
```

By following this structure, you'll have a comprehensive test suite that verifies all aspects of your application while maintaining good organization and readability.
