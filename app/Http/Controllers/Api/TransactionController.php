<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Regular users can only see their own transactions
        if (!$user->isAdmin()) {
            $transactions = $user->transactions()->with('wallet')->latest()->paginate(15);
        } else {
            // Admins can see all transactions
            $transactions = Transaction::with(['user', 'wallet'])->latest()->paginate(15);
        }

        return TransactionResource::collection($transactions);
    }

    /**
     * Store a newly created transaction in storage (admin only).
     */
    public function store(Request $request)
    {
        // Only admins can manually create transactions
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'wallet_id' => 'required|exists:wallets,id',
            'amount' => 'required|numeric',
            'type' => 'required|string|in:deposit,purchase,refund,adjustment',
            'description' => 'required|string',
            'status' => 'required|string|in:pending,completed,failed',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $transaction = Transaction::create($request->all());

        return new TransactionResource($transaction->load(['user', 'wallet']));
    }

    /**
     * Display the specified transaction.
     */
    public function show(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        // Regular users can only see their own transactions
        if ($user->id !== $transaction->user_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new TransactionResource($transaction->load(['user', 'wallet']));
    }

    /**
     * Update the specified transaction status (admin only).
     */
    public function update(Request $request, Transaction $transaction)
    {
        // Only admins can update transactions
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,completed,failed',
            'description' => 'sometimes|string',
            'metadata' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Handle transaction status change
        if ($request->status !== $transaction->status) {
            // If changing to completed
            if ($request->status === 'completed' && $transaction->status !== 'completed') {
                // If it's a deposit, add funds to wallet
                if ($transaction->type === 'deposit') {
                    $wallet = $transaction->wallet;
                    $wallet->addFunds($transaction->amount);
                }
                // If it's a refund, add funds to wallet
                elseif ($transaction->type === 'refund') {
                    $wallet = $transaction->wallet;
                    $wallet->addFunds($transaction->amount);
                }
            }

            // If changing from completed to something else
            if ($transaction->status === 'completed' && $request->status !== 'completed') {
                // If it's a deposit or refund, remove funds from wallet
                if ($transaction->type === 'deposit' || $transaction->type === 'refund') {
                    $wallet = $transaction->wallet;
                    $wallet->deductFunds($transaction->amount);
                }
            }
        }

        $transaction->status = $request->status;

        if ($request->has('description')) {
            $transaction->description = $request->description;
        }

        if ($request->has('metadata')) {
            $transaction->metadata = array_merge($transaction->metadata ?? [], $request->metadata);
        }

        $transaction->save();

        return new TransactionResource($transaction->load(['user', 'wallet']));
    }

    /**
     * Get user transactions.
     */
    public function userTransactions(Request $request, $userId)
    {
        $user = $request->user();

        // Regular users can only see their own transactions
        if ($user->id != $userId && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transactions = Transaction::where('user_id', $userId)
            ->with('wallet')
            ->latest()
            ->paginate(15);

        return TransactionResource::collection($transactions);
    }
}
