<?php

namespace App\Console\Commands;

use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckExpiredVouchers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hotspot:check-expired-vouchers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for expired vouchers and deauthenticate devices';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for expired vouchers...');

        // Get active vouchers where total used time exceeds the service plan duration
        $activeVouchers = Voucher::where('is_active', true)
            ->where('status', 'active')
            ->get();

        $expiredVouchers = collect();

        foreach ($activeVouchers as $voucher) {
            // Calculate total used time (stored used_time + time since activation)
            $now = Carbon::now();
            $servicePlanDurationMinutes = $voucher->servicePlan ? ($voucher->servicePlan->duration_hours * 60) : 0;
            $usedMinutesSinceActivation = $voucher->activation_time ? $voucher->activation_time->diffInMinutes($now) : 0;
            $totalUsedMinutes = $voucher->used_time + $usedMinutesSinceActivation;
            $this->info("Voucher {$voucher->code} has used {$totalUsedMinutes} minutes out of {$servicePlanDurationMinutes} minutes");
            // Check if the voucher has exceeded its allowed time
            if ($totalUsedMinutes >= $servicePlanDurationMinutes) {
                $expiredVouchers->push($voucher);
            }
        }

        $count = $expiredVouchers->count();
        $this->info("Found {$count} expired vouchers");

        foreach ($expiredVouchers as $voucher) {
            $this->info("Processing voucher {$voucher->code}");

            // Get connected device sessions
            $connectedDevices = $voucher->deviceSessions()
                ->where('is_connected', true)
                ->get();

            // Disconnect all connected devices
            foreach ($connectedDevices as $device) {
                $device->disconnect();
                $this->info("Disconnected device: {$device->device_id}");
            }

            // Expire the voucher
            $voucher->expire();
            $this->info("Expired voucher: {$voucher->code}");
        }

        $this->info('Finished processing expired vouchers');

        return Command::SUCCESS;
    }
}
