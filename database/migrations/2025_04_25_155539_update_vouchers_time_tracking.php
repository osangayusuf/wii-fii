<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            // Add activation_time column
            $table->timestamp('activation_time')->nullable()->comment('Time when the voucher was last activated');

            // Make sure used_time exists (in case previous migration was not run)
            if (!Schema::hasColumn('vouchers', 'used_time')) {
                $table->integer('used_time')->default(0)->comment('Time used in minutes when voucher is paused');
            }

            // Remove start_time and end_time columns
            $table->dropColumn(['start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            // Add back the start_time and end_time columns
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();

            // Remove the activation_time column
            $table->dropColumn('activation_time');
        });
    }
};
