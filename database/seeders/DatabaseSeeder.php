<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user with wallet
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create wallet for the test user
        Wallet::create([
            'user_id' => $user->id,
            'balance' => 10000.00, // Start with 10,000 units of currency for testing
        ]);

        // Seed service plans
        $this->call([
            ServicePlanSeeder::class,
        ]);
    }
}
