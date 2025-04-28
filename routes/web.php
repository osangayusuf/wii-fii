<?php

use App\Http\Controllers\HotspotController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Hotspot routes
Route::get('/hotspot', [HotspotController::class, 'landing'])->name('hotspot.landing');
Route::get('/hotspot/status', [HotspotController::class, 'status'])->name('hotspot.status');
