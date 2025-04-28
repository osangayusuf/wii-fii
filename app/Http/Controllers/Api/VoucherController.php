<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeviceSessionResource;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\VoucherResource;
use App\Models\ServicePlan;
use App\Models\Transaction;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoucherController extends Controller
{
    /**
     * Get user vouchers
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $vouchers = $user->vouchers()->with('servicePlan')->latest()->get();

        return VoucherResource::collection($vouchers);
    }

    /**
     * Purchase a new voucher
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function purchase(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_plan_id' => 'required|exists:service_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $wallet = $user->wallet;
        $servicePlan = ServicePlan::findOrFail($request->service_plan_id);

        // Check if service plan is active
        if (!$servicePlan->is_active) {
            return response()->json([
                'message' => 'The selected service plan is not available',
            ], 400);
        }

        // Check if user has enough funds
        if ($wallet->balance < $servicePlan->price) {
            return response()->json([
                'message' => 'Insufficient funds in wallet',
                'required' => $servicePlan->price,
                'available' => $wallet->balance,
            ], 400);
        }

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'amount' => $servicePlan->price,
            'type' => 'purchase',
            'description' => 'Purchased ' . $servicePlan->name . ' plan',
            'status' => 'pending',
            'metadata' => [
                'service_plan_id' => $servicePlan->id,
                'service_plan_name' => $servicePlan->name,
            ],
        ]);

        // Deduct funds from wallet
        if (!$wallet->deductFunds($servicePlan->price)) {
            $transaction->markAsFailed();

            return response()->json([
                'message' => 'Failed to process payment',
            ], 500);
        }

        // Create voucher
        $voucher = Voucher::create([
            'user_id' => $user->id,
            'service_plan_id' => $servicePlan->id,
            'status' => 'unused',
            'is_active' => false,
            'active_devices' => 0,
            'allowed_devices' => $servicePlan->max_devices,
        ]);

        // Mark transaction as completed
        $transaction->update([
            'status' => 'completed',
            'metadata' => array_merge($transaction->metadata, [
                'voucher_id' => $voucher->id,
                'voucher_code' => $voucher->code,
            ]),
        ]);

        return response()->json([
            'message' => 'Voucher purchased successfully',
            'voucher' => new VoucherResource($voucher->load('servicePlan')),
            'transaction' => new TransactionResource($transaction),
        ]);
    }

    /**
     * Get a specific voucher
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\Resources\Json\JsonResource
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $voucher = $user->vouchers()->with(['servicePlan', 'deviceSessions'])->findOrFail($id);

        return new VoucherResource($voucher);
    }

    /**
     * Validate and authenticate a voucher code
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function authenticate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'voucher_code' => 'required|string',
            'device_id' => 'required|string',
            'device_info' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find voucher by code
        $voucher = Voucher::where('code', $request->voucher_code)->first();

        if (!$voucher) {
            return response()->json([
                'message' => 'Invalid voucher code',
            ], 404);
        }

        // Check if voucher is valid
        if (!$voucher->isValid() && $voucher->status !== 'paused' && $voucher->status !== 'unused') {
            return response()->json([
                'message' => 'This voucher has expired',
                'status' => $voucher->status,
            ], 400);
        }

        // Add device to voucher
        $deviceSession = $voucher->addDevice($request->device_id, $request->device_info ?? []);

        if (!$deviceSession) {
            if ($voucher->active_devices >= $voucher->allowed_devices) {
                return response()->json([
                    'message' => 'Maximum number of allowed devices reached',
                    'active_devices' => $voucher->active_devices,
                    'allowed_devices' => $voucher->allowed_devices,
                ], 400);
            }

            return response()->json([
                'message' => 'Failed to authenticate device',
            ], 500);
        }

        // Make sure voucher is activated
        if (!$voucher->activate()) {
            return response()->json([
                'message' => 'Failed to activate voucher',
            ], 500);
        }

        return response()->json([
            'message' => 'Device authenticated successfully',
            'voucher' => new VoucherResource($voucher->refresh()->load('servicePlan')),
            'device_session' => new DeviceSessionResource($deviceSession),
            'remaining_minutes' => $voucher->getRemainingTimeInMinutes(),
        ]);
    }

    /**
     * Disconnect a device from the voucher
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function disconnect(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'voucher_code' => 'required|string',
            'device_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find voucher by code
        $voucher = Voucher::where('code', $request->voucher_code)->first();

        if (!$voucher) {
            return response()->json([
                'message' => 'Invalid voucher code',
            ], 404);
        }

        // Remove device from voucher
        if (!$voucher->removeDevice($request->device_id)) {
            return response()->json([
                'message' => 'Device not found or already disconnected',
            ], 400);
        }

        return response()->json([
            'message' => 'Device disconnected successfully',
            'voucher' => new VoucherResource($voucher->refresh()),
            'active_devices' => $voucher->active_devices,
            'status' => $voucher->status,
        ]);
    }

    /**
     * Check voucher status
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'voucher_code' => 'required|string',
            'device_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find voucher by code
        $voucher = Voucher::where('code', $request->voucher_code)
            ->with(['servicePlan', 'deviceSessions' => function ($query) use ($request) {
                $query->where('device_id', $request->device_id);
            }])
            ->first();


        if (!$voucher) {
            return response()->json([
                'message' => 'Invalid voucher code',
            ], 404);
        }

        // Get device session
        $deviceSession = $voucher->deviceSessions->first();
        return response()->json([
            'voucher' => new VoucherResource($voucher),
            'device_session' => $deviceSession ? new DeviceSessionResource($deviceSession) : null,
            'is_valid' => $voucher->isValid(),
            'is_connected' => $deviceSession ? $deviceSession->is_connected : false,
        ]);
    }
}
