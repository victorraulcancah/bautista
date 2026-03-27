<?php

use App\Http\Controllers\Api\PagoApiController;
use App\Http\Controllers\Api\GaleriaApiController;
use App\Http\Controllers\Api\MensajeApiController;
use App\Http\Controllers\Api\MensajeriaGrupoApiController;
use App\Http\Controllers\Api\NoticiaApiController;
use App\Http\Controllers\Api\UsuarioBusquedaApiController;
use App\Http\Controllers\Api\InstitucionApiController;
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
use App\Http\Controllers\Api\ActividadApiController;
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

    // Instituciones
    Route::apiResource('instituciones', InstitucionApiController::class);

    // Galería de la institución
    Route::apiResource('galeria', GaleriaApiController::class)->except(['show']);

    // Noticias de la institución
    Route::apiResource('noticias', NoticiaApiController::class)->except(['show']);

    // Mensajería
    Route::get('mensajes',                        [MensajeApiController::class, 'index']);
    Route::post('mensajes',                       [MensajeApiController::class, 'store']);
    Route::get('mensajes/no-leidos',              [MensajeApiController::class, 'noLeidos']);
    Route::get('mensajes/{id}',                   [MensajeApiController::class, 'show']);
    Route::post('mensajes/{id}/responder',        [MensajeApiController::class, 'reply']);
    Route::get('mensajeria/grupos',               [MensajeriaGrupoApiController::class, 'index']);
    Route::post('mensajeria/grupos',              [MensajeriaGrupoApiController::class, 'store']);
    Route::get('mensajeria/cursos',               [MensajeriaGrupoApiController::class, 'cursos']);
    Route::get('mensajeria/cursos/{id}/alumnos',  [MensajeriaGrupoApiController::class, 'alumnosPorCurso']);
    Route::get('usuarios/buscar',                 UsuarioBusquedaApiController::class);

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

    // Pagos
    Route::prefix('pagos')->group(function () {
        Route::get('pagadores',                    [PagoApiController::class, 'indexPagadores']);
        Route::get('contactos/{contactoId}',       [PagoApiController::class, 'porContacto']);
        Route::post('/',                           [PagoApiController::class, 'store']);
        Route::put('/{id}',                        [PagoApiController::class, 'update']);
        Route::delete('/{id}',                     [PagoApiController::class, 'destroy']);
    });

    // Actividades (Exámenes Virtuales)
    Route::get('actividades/tipos',     [ActividadApiController::class, 'tipos']);
    Route::apiResource('actividades',   ActividadApiController::class);

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
