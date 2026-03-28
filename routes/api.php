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
use App\Http\Controllers\Api\DocenteCursoApiController;
use App\Http\Controllers\Api\UsuarioApiController;
use App\Http\Controllers\Api\BlogApiController;
use App\Http\Controllers\Api\AsistenciaGeneralApiController;
use App\Http\Controllers\Api\MediosApiController;
use App\Http\Controllers\Api\MensajeriaApiController;
use App\Http\Controllers\Api\PadreApiController;
use App\Http\Controllers\Api\CalificacionApiController;
use App\Http\Controllers\Api\ExamenResolucionApiController;
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
    Route::get('estudiantes/{id}/contactos',  [EstudianteApiController::class, 'contactos']);
    Route::post('estudiantes/{id}/contactos', [EstudianteApiController::class, 'guardarContacto']);

    // Docentes
    Route::apiResource('docentes', DocenteApiController::class);
    Route::get('docentes/{docenteId}/cursos',             [DocenteCursoApiController::class, 'index']);
    Route::post('docentes/{docenteId}/cursos',            [DocenteCursoApiController::class, 'store']);
    Route::delete('docentes/{docenteId}/cursos/{id}',     [DocenteCursoApiController::class, 'destroy']);
    Route::get('docentes/{docenteId}/horario',            [DocenteCursoApiController::class, 'horario']);

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
    Route::get('actividades/{id}/notas', [CalificacionApiController::class, 'indexByActivity']);
    Route::post('actividades/{id}/calificar', [CalificacionApiController::class, 'calificar']);
    Route::post('examenes/comenzar', [ExamenResolucionApiController::class, 'comenzar']);
    Route::post('examenes/{id}/responder', [ExamenResolucionApiController::class, 'responder']);
    Route::post('examenes/{id}/finalizar', [ExamenResolucionApiController::class, 'finalizar']);

    // Portal Alumno
    Route::get('alumno/dashboard', [AlumnoApiController::class, 'dashboard']);
    Route::get('alumno/cursos', [AlumnoApiController::class, 'cursos']);
    Route::get('alumno/curso/{id}', [AlumnoApiController::class, 'cursoDetalle']);
    Route::get('alumno/clase/{id}', [AlumnoApiController::class, 'claseDetalle']);
    Route::post('alumno/actividad/{id}/entregar', [AlumnoApiController::class, 'entregarActividad']);

    // Portal Docente
    Route::get('docente/dashboard', [DocenteApiController::class, 'dashboard']);
    Route::get('docente/mis-cursos', [DocenteApiController::class, 'misCursos']);
    Route::post('docente/unidad', [DocenteApiController::class, 'crearUnidad']);
    Route::post('docente/clase', [DocenteApiController::class, 'crearClase']);
    Route::post('docente/actividad', [DocenteApiController::class, 'crearActividad']);
    Route::get('docente/curso/{id}/alumnos', [DocenteApiController::class, 'alumnosSeccion']);
    Route::post('docente/asistencia/iniciar', [DocenteApiController::class, 'iniciarAsistencia']);
    Route::post('docente/asistencia/{id}/marcar', [DocenteApiController::class, 'marcarAsistencia']);

    // Mensajería
    Route::get('mensajes/recibidos', [MensajeriaApiController::class, 'recibidos']);
    Route::get('mensajes/enviados', [MensajeriaApiController::class, 'enviados']);
    Route::get('mensajes/contactos', [MensajeriaApiController::class, 'buscarContactos']);
    Route::post('mensajes/enviar', [MensajeriaApiController::class, 'enviar']);
    Route::get('mensajes/{id}', [MensajeriaApiController::class, 'ver']);
    Route::post('mensajes/{id}/responder', [MensajeriaApiController::class, 'responder']);

    // Blog y Noticias
    Route::get('blog', [BlogApiController::class, 'index']);
    Route::get('blog/{id}', [BlogApiController::class, 'show']);

    // Biblioteca de Medios
    Route::get('medios', [MediosApiController::class, 'index']);
    Route::post('medios/upload', [MediosApiController::class, 'store']);
    Route::delete('medios/{id}', [MediosApiController::class, 'destroy']);

    // Asistencia General (QR)
    Route::get('asistencia/usuarios', [AsistenciaGeneralApiController::class, 'index']);
    Route::get('asistencia/usuario/{id}', [AsistenciaGeneralApiController::class, 'show']);
    Route::get('asistencia/usuario/{id}/export', [AsistenciaGeneralApiController::class, 'export']);
    Route::post('asistencia/marcar-qr', [AsistenciaGeneralApiController::class, 'marcarQR']);
    Route::get('asistencia/historial', [AsistenciaGeneralApiController::class, 'historial']);

    // Portal Padre
    Route::get('padre/hijos', [PadreApiController::class, 'hijos']);
    Route::get('padre/hijo/{id}/resumen', [PadreApiController::class, 'hijoDetalle']);

    // Usuarios
    Route::apiResource('usuarios', UsuarioApiController::class)->only(['index', 'show', 'store', 'update']);
    Route::patch('usuarios/{id}/estado',       [UsuarioApiController::class, 'toggleEstado']);
    Route::get('usuarios/{id}/historial',      [UsuarioApiController::class, 'historial']);
    Route::patch('usuarios/{id}/credenciales', [UsuarioApiController::class, 'resetCredenciales']);

    // Matrícula — Aperturas
    Route::prefix('matriculas')->group(function () {
        Route::get('aperturas',                              [MatriculaApiController::class, 'indexAperturas']);
        Route::post('aperturas',                             [MatriculaApiController::class, 'storeApertura']);
        Route::get('aperturas/{id}',                         [MatriculaApiController::class, 'showApertura']);
        Route::put('aperturas/{id}',                         [MatriculaApiController::class, 'updateApertura']);
        Route::delete('aperturas/{id}',                      [MatriculaApiController::class, 'destroyApertura']);

        // Matrículas dentro de una apertura
        Route::get('aperturas/{aperturaId}/estudiantes',     [MatriculaApiController::class, 'indexMatriculas']);
        Route::get('aperturas/{aperturaId}/por-nivel',       [MatriculaApiController::class, 'indexPorNivel']);
        Route::get('aperturas/{aperturaId}/disponibles',     [MatriculaApiController::class, 'estudiantesDisponibles']);
        Route::post('/',                                     [MatriculaApiController::class, 'storeMatricula']);
        Route::delete('/{id}',                              [MatriculaApiController::class, 'destroyMatricula']);
    });

    // Horarios de Asistencia
    Route::apiResource('horarios-asistencia', \App\Http\Controllers\Api\HorarioAsistenciaApiController::class);
});
