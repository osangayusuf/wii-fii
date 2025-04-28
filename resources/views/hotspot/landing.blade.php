<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ env("APP_NAME") }} - Connect to Hostpot</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div class="text-center mb-6">
                <h1 class="text-2xl font-bold text-blue-600">WiFi Hotspot</h1>
                <p class="text-gray-500">Please enter your voucher code to access the internet</p>
            </div>

            <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"></div>
            <div id="success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"></div>

            <form id="voucher-form" class="space-y-4">
                <div>
                    <label for="voucher_code" class="block text-sm font-medium text-gray-700">Voucher Code</label>
                    <input type="text" id="voucher_code" name="voucher_code"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                           placeholder="Enter your voucher code" required>
                </div>

                <input type="hidden" id="device_id" name="device_id" value="{{ $deviceInfo['device_id'] }}">
                <input type="hidden" id="device_ip" name="device_ip" value="{{ $deviceInfo['ip_address'] }}">

                <button type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Connect
                </button>
            </form>

            <div class="mt-6 pt-4 border-t border-gray-200">
                <h2 class="text-lg font-semibold text-gray-700 mb-2">Don't have a voucher?</h2>
                <p class="text-sm text-gray-500 mb-4">Purchase a plan to get connected:</p>

                <div class="space-y-3">
                    @foreach($plans as $plan)
                    <div class="border rounded-md p-3 hover:bg-gray-50">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-medium text-gray-800">{{ $plan->name }}</h3>
                                <p class="text-xs text-gray-500">{{ $plan->description }}</p>
                                <p class="text-xs text-gray-500">Max Devices: {{ $plan->max_devices }}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-blue-600">₦{{ number_format($plan->price, 2) }}</p>
                                <a href="/register" class="text-xs text-blue-600 hover:underline">Buy Now</a>
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>

                <div class="mt-4 text-center">
                    <p class="text-sm text-gray-500">
                        Already have an account? <a href="/login" class="text-blue-600 hover:underline">Login</a>
                    </p>
                </div>
            </div>
        </div>

        <div class="mt-6 text-center text-xs text-gray-500">
            <p>© {{ date('Y') }} Wii-Fii Hotspot. All rights reserved.</p>
            <p class="mt-1">Device ID: {{ $deviceInfo['device_id'] }} | IP: {{ $deviceInfo['ip_address'] }}</p>
        </div>
    </div>
</body>
</html>
