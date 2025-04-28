# Wii-Fii Backend API

A modern WiFi Hotspot management system API that allows users to purchase plans, manage their wallets, and access WiFi services.

## Features

-   **User Authentication & Management**

    -   Registration and login system
    -   JWT-based authentication with Sanctum
    -   Password reset functionality
    -   Profile management

-   **WiFi Service Plans**

    -   Multiple plan offerings with different durations and data limits
    -   Plan browsing and purchasing system
    -   Dynamic pricing

-   **Wallet System**

    -   Digital wallet for each user
    -   Secure transaction processing with Paystack integration
    -   Balance management
    -   Transaction history

-   **Voucher Management**

    -   Generate and redeem voucher codes
    -   Voucher-based WiFi authentication
    -   Admin tools for voucher creation

-   **Device Session Management**

    -   Track connected devices
    -   Monitor usage and data consumption
    -   Session timeout and management

-   **Admin Dashboard**
    -   User management
    -   Transaction oversight
    -   Service plan administration
    -   System metrics and analytics

## Technology Stack

-   **Framework**: Laravel
-   **Database**: SQLite (development), MySQL (production)
-   **Authentication**: Laravel Sanctum
-   **API**: RESTful API design
-   **Payment Gateway**: Paystack
-   **Testing**: Pest PHP Testing Framework

## API Documentation

### Authentication Endpoints

-   `POST /api/v1/auth/register` - Register a new user
-   `POST /api/v1/auth/login` - Log in and receive authentication token
-   `GET /api/v1/auth/profile` - Get current user profile
-   `POST /api/v1/auth/logout` - Log out and invalidate token

### User Management

-   `GET /api/v1/users` - List all users (admin)
-   `GET /api/v1/users/{id}` - Get specific user details
-   `PUT /api/v1/users/{id}` - Update user information
-   `DELETE /api/v1/users/{id}` - Delete a user

### Service Plan Endpoints

-   `GET /api/v1/plans` - List all available service plans
-   `GET /api/v1/plans/{id}` - Get details of a specific plan
-   `POST /api/v1/plans` - Create a new service plan (admin)
-   `PUT /api/v1/plans/{id}` - Update a service plan (admin)
-   `DELETE /api/v1/plans/{id}` - Delete a service plan (admin)

### Wallet Endpoints

-   `GET /api/v1/wallet` - Get wallet information and balance
-   `GET /api/v1/wallet/{id}` - Get specific wallet details
-   `PUT /api/v1/wallet/{id}` - Update wallet information
-   `POST /api/v1/wallet/{id}/fund` - Add funds to wallet
-   `GET /api/v1/wallet/{id}/transactions` - List wallet transactions
-   `GET /api/v1/wallet/verify-funding` - Paystack callback verification

### Transaction Endpoints

-   `GET /api/v1/transactions` - List all transactions
-   `GET /api/v1/transactions/{id}` - Get transaction details
-   `PUT /api/v1/transactions/{id}` - Update transaction status
-   `GET /api/v1/transactions/user/{userId}` - Get user transactions

### Voucher Endpoints

-   `GET /api/v1/vouchers` - List available vouchers
-   `POST /api/v1/vouchers/purchase` - Purchase a voucher
-   `GET /api/v1/vouchers/{id}` - Get voucher details

### Hotspot Authentication

-   `POST /api/v1/hotspot/authenticate` - Authenticate with voucher
-   `POST /api/v1/hotspot/disconnect` - Disconnect from hotspot
-   `POST /api/v1/hotspot/status` - Check connection status

### Device Session Endpoints

-   `GET /api/v1/devices` - List user's connected devices
-   `GET /api/v1/devices/{id}` - Get device session details
-   `PUT /api/v1/devices/{id}/status` - Update device session status
-   `DELETE /api/v1/devices/{id}` - End a device session
-   `GET /api/v1/devices/voucher/{voucherId}` - Get sessions by voucher

### Webhook Handlers

-   `POST /api/v1/webhook/paystack` - Handle Paystack payment notifications

## Web Routes

-   `GET /` - Landing page
-   `GET /hotspot` - Hotspot landing page
-   `GET /hotspot/status` - Hotspot status page

## Installation and Setup

1. Clone the repository
2. Install dependencies with Composer:
    ```
    composer install
    ```
3. Copy `.env.example` to `.env` and configure your environment
4. Generate application key:
    ```
    php artisan key:generate
    ```
5. Run migrations:
    ```
    php artisan migrate
    ```
6. Seed the database:
    ```
    php artisan db:seed
    ```
7. Start the development server:
    ```
    php artisan serve
    ```

## Testing

Run tests using Pest:

```
php artisan test
```

## License

[MIT License](LICENSE)
