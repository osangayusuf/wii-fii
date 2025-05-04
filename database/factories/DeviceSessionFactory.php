<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeviceSession>
 */
class DeviceSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'device_id' => $this->faker->uuid(),
            'ip_address' => $this->faker->ipv4(),
            'connected_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
            'is_connected' => true,
        ];
    }
}
