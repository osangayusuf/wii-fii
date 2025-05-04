<?php

namespace Database\Seeders;

use App\Models\User;
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
        User::factory()->hasWallet()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);



        // Seed service plans
        $this->call([
            ServicePlanSeeder::class,
        ]);
    }
}
