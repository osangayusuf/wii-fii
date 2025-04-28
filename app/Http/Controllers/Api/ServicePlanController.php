<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServicePlanResource;
use App\Models\ServicePlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServicePlanController extends Controller
{
    /**
     * Display a listing of service plans.
     */
    public function index()
    {
        $plans = ServicePlan::where('is_active', true)->get();
        return ServicePlanResource::collection($plans);
    }

    /**
     * Store a newly created service plan in storage.
     */
    public function store(Request $request)
    {
        // Only admins can create plans
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_hours' => 'required|integer|min:1',
            'max_devices' => 'required|integer|min:1',
            'bandwidth_limit_mbps' => 'nullable|integer|min:1',
            'data_limit_mb' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan = ServicePlan::create($request->all());

        return new ServicePlanResource($plan);
    }

    /**
     * Display the specified service plan.
     */
    public function show(ServicePlan $servicePlan)
    {
        return new ServicePlanResource($servicePlan);
    }

    /**
     * Update the specified service plan in storage.
     */
    public function update(Request $request, ServicePlan $servicePlan)
    {
        // Only admins can update plans
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_hours' => 'sometimes|integer|min:1',
            'max_devices' => 'sometimes|integer|min:1',
            'bandwidth_limit_mbps' => 'nullable|integer|min:1',
            'data_limit_mb' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $servicePlan->update($request->all());

        return new ServicePlanResource($servicePlan);
    }

    /**
     * Remove the specified service plan from storage.
     */
    public function destroy(Request $request, ServicePlan $servicePlan)
    {
        // Only admins can delete plans
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Instead of deleting, deactivate the plan
        $servicePlan->is_active = false;
        $servicePlan->save();

        return response()->json([
            'message' => 'Service plan deactivated successfully',
            'plan' => new ServicePlanResource($servicePlan),
        ]);
    }

    /**
     * List all service plans (including inactive ones) - admin only.
     */
    public function listAll(Request $request)
    {
        // Only admins can see all plans
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plans = ServicePlan::all();
        return ServicePlanResource::collection($plans);
    }
}
