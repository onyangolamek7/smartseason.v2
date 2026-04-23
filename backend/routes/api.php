<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\FieldUpdateController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/fields',             [FieldController::class, 'index']);
    Route::post('/fields',            [FieldController::class, 'store']);
    Route::get('/fields/{field}',     [FieldController::class, 'show']);
    Route::put('/fields/{field}',     [FieldController::class, 'update']);
    Route::delete('/fields/{field}',  [FieldController::class, 'destroy']);
    Route::post('/fields/{field}/abandon', [FieldController::class, 'abandon']);
    Route::post('/fields/{field}/restore', [FieldController::class, 'restore']);

    Route::get('/fields/{field}/updates',  [FieldUpdateController::class, 'index']);
    Route::post('/fields/{field}/updates', [FieldUpdateController::class, 'store']);

    Route::get('/agents', [FieldController::class, 'agents']);

    Route::get('/users',           [UserController::class, 'index']);
    Route::post('/users',          [UserController::class, 'store']);
    Route::put('/users/{user}',    [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});
