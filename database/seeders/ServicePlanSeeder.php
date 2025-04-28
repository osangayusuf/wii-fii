<?php

namespace Database\Seeders;

use App\Models\ServicePlan;
use Illuminate\Database\Seeder;

class ServicePlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic - 1 Hour',
                'description' => 'Basic internet access for 1 hour. Limited to 1 device.',
                'price' => 100.00,
                'duration_hours' => 1,
                'max_devices' => 1,
                'bandwidth_limit_mbps' => 5,
                'data_limit_mb' => 1000, // 1GB
                'is_active' => true,
            ],
            [
                'name' => 'Standard - 3 Hours',
                'description' => 'Standard internet access for 3 hours. Limited to 2 devices.',
                'price' => 250.00,
                'duration_hours' => 3,
                'max_devices' => 2,
                'bandwidth_limit_mbps' => 10,
                'data_limit_mb' => 3000, // 3GB
                'is_active' => true,
            ],
            [
                'name' => 'Premium - 24 Hours',
                'description' => 'Premium internet access for 24 hours. Limited to 3 devices.',
                'price' => 1000.00,
                'duration_hours' => 24,
                'max_devices' => 3,
                'bandwidth_limit_mbps' => 20,
                'data_limit_mb' => 10000, // 10GB
                'is_active' => true,
            ],
            [
                'name' => 'Business - 7 Days',
                'description' => 'Business-grade internet access for 7 days. Limited to 5 devices.',
                'price' => 5000.00,
                'duration_hours' => 168, // 7 days
                'max_devices' => 5,
                'bandwidth_limit_mbps' => 50,
                'data_limit_mb' => 100000, // 100GB
                'is_active' => true,
            ]
        ];

        foreach ($plans as $plan) {
            ServicePlan::create($plan);
        }
    }
}
