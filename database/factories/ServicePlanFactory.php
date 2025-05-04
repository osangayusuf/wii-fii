<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ServicePlan>
 */
class ServicePlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 0, 10000),
            'duration_hours' => $this->faker->numberBetween(1, 50), // 1 hour to 7 days
            'max_devices' => $this->faker->numberBetween(1, 3),
            'bandwidth_limit_mbps' => $this->faker->numberBetween(1, 1000),
            'data_limit_mb' => $this->faker->numberBetween(100, 100000), // 100MB to 100GB
            'is_active' => $this->faker->boolean(),
        ];
    }
}
