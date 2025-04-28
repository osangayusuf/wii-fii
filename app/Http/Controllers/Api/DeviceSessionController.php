<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeviceSessionResource;
use App\Models\DeviceSession;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeviceSessionController extends Controller
{
    /**
     * Display a listing of device sessions (admin only).
     */
    public function index(Request $request)
    {
        // Only admins can see all device sessions
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deviceSessions = DeviceSession::with('voucher')->latest()->paginate(20);

        return DeviceSessionResource::collection($deviceSessions);
    }

    /**
     * Display the specified device session.
     */
    public function show(Request $request, DeviceSession $deviceSession)
    {
        $user = $request->user();

        // Users can only view sessions for their own vouchers
        $voucher = $deviceSession->voucher;
        if ($user->id !== $voucher->user_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new DeviceSessionResource($deviceSession->load('voucher'));
    }

    /**
     * Update the device session connection status.
     */
    public function updateStatus(Request $request, DeviceSession $deviceSession)
    {
        $user = $request->user();

        // Users can only update sessions for their own vouchers
        $voucher = $deviceSession->voucher;
        if ($user->id !== $voucher->user_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_connected' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->is_connected) {
            // Connect device
            $deviceSession->connect();
        } else {
            // Disconnect device
            $deviceSession->disconnect();

            // Update voucher active devices count
            $voucher->decrement('active_devices');

            // If no more active devices and voucher is active, pause it
            if ($voucher->active_devices <= 0 && $voucher->status === 'active') {
                $voucher->pause();
            }
        }

        return new DeviceSessionResource($deviceSession->refresh());
    }

    /**
     * Remove the specified device session.
     */
    public function destroy(Request $request, DeviceSession $deviceSession)
    {
        $user = $request->user();

        // Only admins can delete device sessions
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // If the device is connected, disconnect it first
        if ($deviceSession->is_connected) {
            $voucher = $deviceSession->voucher;
            $voucher->decrement('active_devices');

            // If no more active devices and voucher is active, pause it
            if ($voucher->active_devices <= 0 && $voucher->status === 'active') {
                $voucher->pause();
            }
        }

        $deviceSession->delete();

        return response()->json(['message' => 'Device session deleted successfully']);
    }

    /**
     * List all device sessions for a specific voucher.
     */
    public function voucherSessions(Request $request, $voucherId)
    {
        $user = $request->user();

        // Find the voucher
        $voucher = Voucher::findOrFail($voucherId);

        // Users can only view sessions for their own vouchers
        if ($user->id !== $voucher->user_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deviceSessions = $voucher->deviceSessions()->latest()->get();

        return DeviceSessionResource::collection($deviceSessions);
    }
}
