<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Voucher>
 */
class VoucherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_plan_id' => $this->faker->numberBetween(1, 4),
            'status' => 'unused',
            'is_active' => false,
            'active_devices' => 0,
            'allowed_devices' => $this->faker->numberBetween(1, 3),

        ];
    }
}
