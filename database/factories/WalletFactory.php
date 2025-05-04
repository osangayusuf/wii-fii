<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Wallet::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'balance' => $this->faker->randomFloat(2, 0, 10000), // Random balance between 0 and 10,000
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => function (array $attributes) {
                return $this->faker->dateTimeBetween($attributes['created_at'], 'now');
            },
        ];
    }

    /**
     * Indicate that the wallet has a zero balance.
     *
     * @return static
     */
    public function empty(): self
    {
        return $this->state(function () {
            return [
                'balance' => 0,
            ];
        });
    }

    /**
     * Indicate that the wallet has a specific balance.
     *
     * @param float $amount
     * @return static
     */
    public function withBalance(float $amount): self
    {
        return $this->state(function () use ($amount) {
            return [
                'balance' => $amount,
            ];
        });
    }

    /**
     * Indicate that the wallet belongs to a specific user.
     *
     * @param int $userId
     * @return static
     */
    public function forUser(int $userId): self
    {
        return $this->state(function () use ($userId) {
            return [
                'user_id' => $userId,
            ];
        });
    }
}
