<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ env("APP_NAME") }} - Hotspot Status</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div class="text-center mb-6">
                <h1 class="text-2xl font-bold text-blue-600">WiFi Hotspot</h1>
                <p class="text-gray-500">Connection Status</p>
            </div>

            <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"></div>
            <div id="success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"></div>

            <div id="loading" class="flex justify-center py-4">
                <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>

            <div id="status-container" class="hidden">
                <div class="bg-blue-50 rounded-lg p-4 mb-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <span id="connection-icon" class="h-8 w-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </span>
                        </div>
                        <div class="ml-3">
                            <h3 id="connection-status" class="text-sm font-medium text-blue-800">Connected</h3>
                            <div class="mt-1 text-sm text-blue-700">
                                <p id="connection-message">You are connected to the internet.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <h3 class="text-sm font-medium text-gray-700">Voucher Details</h3>
                        <div class="mt-2 bg-gray-50 rounded px-3 py-2">
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div class="text-gray-500">Code:</div>
                                <div id="voucher-code" class="font-medium text-gray-900">-</div>

                                <div class="text-gray-500">Status:</div>
                                <div id="voucher-status" class="font-medium text-gray-900">-</div>

                                <div class="text-gray-500">Plan:</div>
                                <div id="service-plan" class="font-medium text-gray-900">-</div>

                                <div class="text-gray-500">Remaining hours:</div>
                                <div id="remaining-hours" class="font-medium text-gray-900">-</div>

                                <div class="text-gray-500">Active Devices:</div>
                                <div id="active-devices" class="font-medium text-gray-900">-</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-sm font-medium text-gray-700">Device Information</h3>
                        <div class="mt-2 bg-gray-50 rounded px-3 py-2">
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div class="text-gray-500">Device ID:</div>
                                <div id="device-id" class="font-medium text-gray-900">{{ $deviceId }}</div>

                                <div class="text-gray-500">Connected At:</div>
                                <div id="connected-at" class="font-medium text-gray-900">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-6 space-y-2">
                    <button id="refresh-btn" class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Refresh Status
                    </button>

                    <button id="disconnect-btn" class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Disconnect
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-6 text-center text-xs text-gray-500">
            <p>© {{ date('Y') }} Wii-Fii Hotspot. All rights reserved.</p>
            <p class="mt-1">Need help? Contact support at support@wiifii.com</p>
        </div>
    </div>

    <!-- Hidden fields for JavaScript -->
    <input type="hidden" id="voucher-code-hidden" value="{{ $voucherCode }}">
</body>
</html>
