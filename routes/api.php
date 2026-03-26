<?php

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\CursoContenidoApiController;
use App\Http\Controllers\Api\MatriculaApiController;
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

    // Contenido de Curso (Unidades y Clases)
    Route::prefix('contenido')->group(function () {
        Route::get('cursos/{cursoId}',                           [CursoContenidoApiController::class, 'show']);
        Route::post('unidades',                                   [CursoContenidoApiController::class, 'storeUnidad']);
        Route::put('unidades/{id}',                              [CursoContenidoApiController::class, 'updateUnidad']);
        Route::delete('unidades/{id}',                           [CursoContenidoApiController::class, 'destroyUnidad']);
        Route::post('cursos/{cursoId}/reordenar-unidades',       [CursoContenidoApiController::class, 'reordenarUnidades']);
        Route::post('clases',                                    [CursoContenidoApiController::class, 'storeClase']);
        Route::put('clases/{id}',                                [CursoContenidoApiController::class, 'updateClase']);
        Route::delete('clases/{id}',                             [CursoContenidoApiController::class, 'destroyClase']);
        Route::post('unidades/{unidadId}/reordenar-clases',      [CursoContenidoApiController::class, 'reordenarClases']);
        Route::post('clases/{claseId}/archivos',                 [CursoContenidoApiController::class, 'subirArchivo']);
        Route::delete('archivos/{archivoId}',                    [CursoContenidoApiController::class, 'eliminarArchivo']);
    });

    // Matrícula — Aperturas
    Route::prefix('matriculas')->group(function () {
        Route::get('aperturas',                              [MatriculaApiController::class, 'indexAperturas']);
        Route::post('aperturas',                             [MatriculaApiController::class, 'storeApertura']);
        Route::get('aperturas/{id}',                         [MatriculaApiController::class, 'showApertura']);
        Route::put('aperturas/{id}',                         [MatriculaApiController::class, 'updateApertura']);
        Route::delete('aperturas/{id}',                      [MatriculaApiController::class, 'destroyApertura']);

        // Matrículas dentro de una apertura
        Route::get('aperturas/{aperturaId}/estudiantes',     [MatriculaApiController::class, 'indexMatriculas']);
        Route::get('aperturas/{aperturaId}/disponibles',     [MatriculaApiController::class, 'estudiantesDisponibles']);
        Route::post('/',                                     [MatriculaApiController::class, 'storeMatricula']);
        Route::delete('/{id}',                              [MatriculaApiController::class, 'destroyMatricula']);
    });
});
