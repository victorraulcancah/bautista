<?php

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CursoApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\DocenteApiController;
use App\Http\Controllers\Api\EstudianteApiController;
use App\Http\Controllers\Api\GradoApiController;
use App\Http\Controllers\Api\NivelEducativoApiController;
use App\Http\Controllers\Api\SeccionApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Bautista La Pascana
|--------------------------------------------------------------------------
| Consumidas por el panel web (React SPA) y la app móvil.
| Header requerido: Authorization: Bearer {token}
*/

// ── Autenticación (público) ───────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthApiController::class, 'login']);
    Route::post('logout', [AuthApiController::class, 'logout']);
});

// ── Rutas protegidas (requiere token Sanctum) ─────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    Route::prefix('auth')->group(function () {
        Route::get('me',     [AuthApiController::class, 'me']);
    });

    // Dashboard
    Route::get('dashboard/stats', [DashboardApiController::class, 'stats']);

    // Estudiantes
    Route::apiResource('estudiantes', EstudianteApiController::class);

    // Docentes
    Route::apiResource('docentes', DocenteApiController::class);

    // Niveles Educativos
    Route::apiResource('niveles', NivelEducativoApiController::class);

    // Grados
    Route::apiResource('grados', GradoApiController::class);

    // Secciones
    Route::apiResource('secciones', SeccionApiController::class);

    // Cursos
    Route::apiResource('cursos', CursoApiController::class);
});
