<?php

namespace App\Http\Controllers;

use App\Models\ServicePlan;
use Illuminate\Http\Request;

class HotspotController extends Controller
{
    /**
     * Show the hotspot landing page.
     *
     * @param Request $request
     * @return \Illuminate\View\View
     */
    public function landing(Request $request)
    {
        // Get the client MAC address and other info
        $deviceInfo = [
            'ip_address' => $request->ip(),
            'mac_address' => $request->header('X-Forwarded-For', $request->ip()),
            'device_id' => $request->query('device_id', uniqid('device_')),
            'user_agent' => $request->userAgent(),
        ];

        // Get active service plans
        $plans = ServicePlan::active()->get();

        return view('hotspot.landing', [
            'deviceInfo' => $deviceInfo,
            'plans' => $plans,
        ]);
    }

    /**
     * Show the hotspot status page after successful authentication.
     *
     * @param Request $request
     * @return \Illuminate\View\View
     */
    public function status(Request $request)
    {
        return view('hotspot.status', [
            'deviceId' => $request->query('device_id'),
            'voucherCode' => $request->query('voucher_code'),
        ]);
    }
}
