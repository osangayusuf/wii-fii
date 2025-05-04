<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Transaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $wallet = Wallet::factory()->create();

        return [
            'user_id' => $wallet->user_id,
            'wallet_id' => $wallet->id,
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'type' => $this->faker->randomElement(['deposit', 'purchase', 'refund']),
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed']),
            'reference' => $this->faker->uuid(),
            'description' => $this->faker->sentence(),
            'metadata' => null,
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => function (array $attributes) {
                return $this->faker->dateTimeBetween($attributes['created_at'], 'now');
            },
        ];
    }

    /**
     * Set the transaction type to deposit.
     *
     * @return static
     */
    public function deposit(): self
    {
        return $this->state(function () {
            return [
                'type' => 'deposit',
                'description' => $this->faker->randomElement([
                    'Wallet funding via Paystack',
                    'Wallet topup',
                    'Deposit'
                ])
            ];
        });
    }

    /**
     * Set the transaction type to purchase.
     *
     * @return static
     */
    public function purchase(): self
    {
        return $this->state(function () {
            return [
                'type' => 'purchase',
                'description' => $this->faker->randomElement([
                    'WiFi voucher purchase',
                    'Service plan purchase',
                    'Plan subscription'
                ])
            ];
        });
    }

    /**
     * Set the transaction status to completed.
     *
     * @return static
     */
    public function completed(): self
    {
        return $this->state(function () {
            return [
                'status' => 'completed',
            ];
        });
    }

    /**
     * Set the transaction status to pending.
     *
     * @return static
     */
    public function pending(): self
    {
        return $this->state(function () {
            return [
                'status' => 'pending',
            ];
        });
    }

    /**
     * Set the transaction status to failed.
     *
     * @return static
     */
    public function failed(): self
    {
        return $this->state(function () {
            return [
                'status' => 'failed',
            ];
        });
    }

    /**
     * Set a specific amount for the transaction.
     *
     * @param float $amount
     * @return static
     */
    public function withAmount(float $amount): self
    {
        return $this->state(function () use ($amount) {
            return [
                'amount' => $amount,
            ];
        });
    }

    /**
     * Associate this transaction with a specific wallet.
     *
     * @param int $walletId
     * @param int|null $userId
     * @return static
     */
    public function forWallet(int $walletId, ?int $userId = null): self
    {
        return $this->state(function () use ($walletId, $userId) {
            $state = [
                'wallet_id' => $walletId,
            ];

            if ($userId !== null) {
                $state['user_id'] = $userId;
            } else {
                // Try to get the user_id from the wallet if not provided
                $wallet = Wallet::find($walletId);
                if ($wallet) {
                    $state['user_id'] = $wallet->user_id;
                }
            }

            return $state;
        });
    }

    /**
     * Set a specific reference for the transaction (useful for Paystack tests).
     *
     * @param string $reference
     * @return static
     */
    public function withReference(string $reference): self
    {
        return $this->state(function () use ($reference) {
            return [
                'reference' => $reference,
            ];
        });
    }
}
