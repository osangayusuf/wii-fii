<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\WalletResource;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    /**
     * Display a listing of all wallets.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && $user->isAdmin()) {
            $wallets = Wallet::with('user')->latest()->paginate(15);
            return WalletResource::collection($wallets);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Store a newly created wallet in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'balance' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if user already has a wallet
        $existingWallet = Wallet::where('user_id', $request->user_id)->first();
        if ($existingWallet) {
            return response()->json([
                'message' => 'User already has a wallet',
                'wallet' => new WalletResource($existingWallet),
            ], 422);
        }

        $wallet = Wallet::create([
            'user_id' => $request->user_id,
            'balance' => $request->balance,
        ]);

        return new WalletResource($wallet);
    }

    /**
     * Display the specified wallet.
     */
    public function show(Request $request, Wallet $wallet)
    {
        $user = $request->user();

        // Users can only view their own wallet unless they're an admin
        if ($user->id !== $wallet->user_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new WalletResource($wallet->load('transactions'));
    }

    /**
     * Update the specified wallet in storage.
     */
    public function update(Request $request, Wallet $wallet)
    {
        $user = $request->user();

        // Only admins can update wallets directly
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'balance' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('balance')) {
            $wallet->balance = $request->balance;
        }

        $wallet->save();

        return new WalletResource($wallet);
    }

    /**
     * Add funds to the wallet using Paystack.
     */
    public function addFunds(Request $request, Wallet $wallet)
    {
        $user = $request->user();

        // Users can only add funds to their own wallet
        if ($user->id !== $wallet->user_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'callback_url' => 'sometimes|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create pending transaction
        $transaction = Transaction::create([
            'user_id' => $wallet->user_id,
            'wallet_id' => $wallet->id,
            'amount' => $request->amount,
            'type' => 'deposit',
            'description' => 'Deposit via Paystack',
            'status' => 'pending',
            'metadata' => [
                'payment_method' => 'paystack',
                'reference' => 'tr_' . Str::random(16), // Generate a unique reference for this transaction
            ],
        ]);

        // Process with Paystack
        return $this->initiatePaystackPayment($request, $user, $wallet, $transaction);
    }

    /**
     * Initiate a Paystack payment.
     */
    protected function initiatePaystackPayment(Request $request, $user, $wallet, $transaction)
    {
        // Amount needs to be in kobo (multiply by 100)
        $amount = $request->amount * 100;

        // Default callback URL if not provided
        $callbackUrl = $request->callback_url ?? 'http://127.0.0.1:5173/wallet';

        // Make request to Paystack API using the configured URL
        $response = Http::withToken(config('services.paystack.secret_key'))
            ->post(config('services.paystack.payment_url'), [
                'email' => $user->email,
                'amount' => $amount,
                'reference' => $transaction->metadata['reference'],
                // 'callback_url' => $callbackUrl,
                'metadata' => [
                    'transaction_id' => $transaction->id,
                    'wallet_id' => $wallet->id,
                    'user_id' => $user->id,
                    'custom_fields' => [
                        [
                            'display_name' => 'Wallet Funding',
                            'variable_name' => 'wallet_funding',
                            'value' => 'Add funds to wallet'
                        ]
                    ]
                ]
            ]);

        if ($response->successful() && $response->json('status')) {
            // Update transaction with paystack details
            $transaction->update([
                'metadata' => array_merge($transaction->metadata, [
                    'payment_url' => $response->json('data.authorization_url'),
                    'access_code' => $response->json('data.access_code'),
                ])
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment initiated',
                'transaction' => new TransactionResource($transaction),
                'payment_url' => $response->json('data.authorization_url'),
                'reference' => $transaction->metadata['reference'],
            ]);
        }

        // Handle failed API request
        $transaction->status = 'failed';
        $transaction->metadata = array_merge($transaction->metadata, [
            'error' => $response->json('message') ?? 'Failed to initialize payment'
        ]);
        $transaction->save();

        return response()->json([
            'status' => 'failed',
            'message' => 'Failed to initialize payment',
            'transaction' => new TransactionResource($transaction),
            'error' => $response->json('message') ?? 'Payment provider error',
        ], 500);
    }

    /**
     * Verify a Paystack payment.
     */
    public function verifyFunding(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return response()->json(['message' => 'No reference provided'], 400);
        }

        // Find transaction by reference
        try {
            $transaction = Transaction::where('metadata->reference', $reference)->firstOrFail()->load('wallet');
        } catch (\Exception $e) {
            // Log the error
            Log::error("Transaction not found for reference: {$reference}");
            return response()->json(['message' => 'Invalid transaction reference'], 404);
        }

        // Verify with Paystack
        $response = Http::withToken(config('services.paystack.secret_key'))
            ->get("https://api.paystack.co/transaction/verify/{$reference}");

        // $response->dd();

        if ($response->successful() && $response->json('status')) {
            $paymentData = $response->json('data');

            // Check if payment was successful
            if ($paymentData['status'] === 'success') {
                // Update transaction
                $transaction->update([
                    'status' => 'completed',
                    'metadata' => array_merge($transaction->metadata, [
                        'paystack_reference' => $paymentData['reference'],
                        'paystack_transaction_id' => $paymentData['id'],
                        'payment_channel' => $paymentData['channel'],
                        'payment_date' => $paymentData['paid_at'],
                    ])
                ]);

                // Update wallet balance
                $wallet = $transaction->wallet;
                $wallet->addFunds($transaction->amount);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment verified successfully',
                    'transaction' => new TransactionResource($transaction),
                    'wallet' => new WalletResource($wallet->refresh()),
                ]);
            } else {
                // Update transaction as failed
                $transaction->update([
                    'status' => 'failed',
                    'metadata' => array_merge($transaction->metadata, [
                        'paystack_reference' => $paymentData['reference'],
                        'payment_status' => $paymentData['status'],
                        'gateway_response' => $paymentData['gateway_response'],
                    ])
                ]);

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Payment verification failed',
                    'transaction' => new TransactionResource($transaction),
                    'reason' => $paymentData['gateway_response'],
                ], 400);
            }
        }

        // Handle failed verification
        return response()->json([
            'message' => 'Failed to verify payment',
            'error' => $response->json('message') ?? 'Payment verification error',
        ], 500);
    }

    /**
     * Handle Paystack webhook.
     */
    public function webhookHandler(Request $request)
    {
        // Validate Paystack webhook signature
        $paystackSignature = $request->header('x-paystack-signature');
        $payload = $request->getContent();
        $calculatedSignature = hash_hmac('sha512', $payload, config('services.paystack.secret_key'));

        if ($paystackSignature !== $calculatedSignature) {
            Log::warning('Invalid Paystack webhook signature');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        // Process webhook
        $event = json_decode($payload, true);

        if ($event['event'] === 'charge.success') {
            $reference = $event['data']['reference'];
            $transaction = Transaction::where('metadata->reference', $reference)->first();

            if (!$transaction) {
                Log::warning("Transaction not found for reference: {$reference}");
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Mark transaction as completed if not already
            if ($transaction->status !== 'completed') {
                $transaction->update([
                    'status' => 'completed',
                    'metadata' => array_merge($transaction->metadata, [
                        'paystack_reference' => $event['data']['reference'],
                        'paystack_transaction_id' => $event['data']['id'],
                        'payment_channel' => $event['data']['channel'],
                        'payment_date' => $event['data']['paid_at'],
                        'webhook_processed' => true,
                    ])
                ]);

                // Update wallet balance
                $wallet = $transaction->wallet;
                $wallet->addFunds($transaction->amount);

                Log::info("Webhook processed for transaction: {$transaction->id}");
            }
        }

        return response()->json(['message' => 'Webhook received']);
    }

    /**
     * Get wallet transactions.
     */
    public function transactions(Request $request, Wallet $wallet)
    {
        $user = $request->user();

        // Users can only view their own wallet transactions unless they're an admin
        if ($user->id !== $wallet->user_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transactions = $wallet->transactions()->latest()->paginate(15);

        return TransactionResource::collection($transactions);
    }
}
