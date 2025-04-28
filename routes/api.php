<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeviceSessionController;
use App\Http\Controllers\Api\ServicePlanController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\WalletController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login', [AuthController::class, 'login'])->name('login');
        Route::post('/logout', [AuthController::class, 'logout'])
            ->middleware('auth:sanctum')
            ->name('auth.logout');
        Route::get('/profile', [AuthController::class, 'profile'])
            ->middleware('auth:sanctum')
            ->name('auth.profile');
    });

    // User Resource Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Public callback route for Paystack (must be defined BEFORE the wallet group)
    Route::get('/wallet/verify-funding', [WalletController::class, 'verifyFunding'])
        ->name('api.wallet.verify-funding');

    // Wallet Routes
    Route::prefix('wallet')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [WalletController::class, 'index'])->name('wallet.index');
        Route::post('/', [WalletController::class, 'store'])->name('wallet.store');
        Route::get('/{wallet}', [WalletController::class, 'show'])->name('wallet.show');
        Route::put('/{wallet}', [WalletController::class, 'update'])->name('wallet.update');
        Route::post('/{wallet}/fund', [WalletController::class, 'addFunds'])->name('wallet.fund');
        Route::get('/{wallet}/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
    });

    // Paystack webhook
    Route::post('/webhook/paystack', [WalletController::class, 'webhookHandler'])
        ->name('api.webhook.paystack');

    // Service Plans
    Route::prefix('plans')->group(function () {
        Route::get('/', [ServicePlanController::class, 'index'])->name('plans.index');
        Route::get('/all', [ServicePlanController::class, 'listAll'])
            ->middleware('auth:sanctum')
            ->name('plans.all');
        Route::get('/{servicePlan}', [ServicePlanController::class, 'show'])->name('plans.show');

        // Admin only routes
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/', [ServicePlanController::class, 'store'])->name('plans.store');
            Route::put('/{servicePlan}', [ServicePlanController::class, 'update'])->name('plans.update');
            Route::delete('/{servicePlan}', [ServicePlanController::class, 'destroy'])->name('plans.destroy');
        });
    });

    // Transaction Routes
    Route::prefix('transactions')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
        Route::put('/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
        Route::get('/user/{userId}', [TransactionController::class, 'userTransactions'])->name('transactions.user');
    });

    // Vouchers (authenticated)
    Route::prefix('vouchers')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [VoucherController::class, 'index'])->name('vouchers.index');
        Route::post('/purchase', [VoucherController::class, 'purchase'])->name('vouchers.purchase');
        Route::get('/{id}', [VoucherController::class, 'show'])->name('vouchers.show');
    });

    // Voucher Authentication (public)
    Route::prefix('hotspot')->group(function () {
        Route::post('/authenticate', [VoucherController::class, 'authenticate'])->name('hotspot.authenticate');
        Route::post('/disconnect', [VoucherController::class, 'disconnect'])->name('hotspot.disconnect');
        Route::post('/status', [VoucherController::class, 'checkStatus'])->name('hotspot.status');
    });

    // Device Sessions
    Route::prefix('devices')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [DeviceSessionController::class, 'index'])->name('devices.index');
        Route::get('/{deviceSession}', [DeviceSessionController::class, 'show'])->name('devices.show');
        Route::put('/{deviceSession}/status', [DeviceSessionController::class, 'updateStatus'])->name('devices.update-status');
        Route::delete('/{deviceSession}', [DeviceSessionController::class, 'destroy'])->name('devices.destroy');
        Route::get('/voucher/{voucherId}', [DeviceSessionController::class, 'voucherSessions'])->name('devices.by-voucher');
    });

    Route::fallback(function () {
        return response()->json(['message' => 'Not Found'], 404);
    });
});
