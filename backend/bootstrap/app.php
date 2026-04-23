<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
            'auth'     => \Illuminate\Auth\Middleware\Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $r) {
            if ($r->is('api/*')) return response()->json(['message' => 'Not found.'], 404);
        });
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, Request $r) {
            if ($r->is('api/*')) return response()->json(['message' => $e->getMessage() ?: 'Forbidden.'], 403);
        });
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $r) {
            if ($r->is('api/*')) return response()->json(['message' => 'Unauthenticated.'], 401);
        });
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $r) {
            if ($r->is('api/*')) return response()->json(['message' => 'Validation failed.', 'errors' => $e->errors()], 422);
        });
    })->create();
