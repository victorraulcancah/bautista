<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('login'))->name('home');

// ── Rutas públicas ──────────────────────────────────────────────────────
Route::get('/login', fn () => Inertia::render('auth/login'))->name('login');

// ── Rutas protegidas ────────────────────────────────────────────────────
Route::middleware(['auth.token'])->group(function () {
    Route::get('/dashboard', function (Illuminate\Http\Request $request) {
        $user = $request->user();
        if ($user->hasRole('Profesor')) {
            return redirect()->route('docente.dashboard');
        }
        if ($user->hasRole('Alumno')) {
            return redirect()->route('alumno.dashboard');
        }
        if ($user->hasRole('Padre de Familia')) {
            return redirect()->route('padre.dashboard');
        }
        return Inertia::render('Dashboard/index');
    })->name('dashboard');
    Route::get('/institucion',         fn () => Inertia::render('Institucion/index'))->name('institucion.index');
    Route::get('/institucion/galeria',   fn () => Inertia::render('Institucion/Galeria/index'))->name('institucion.galeria');
    Route::get('/institucion/noticias',  fn () => Inertia::render('Institucion/Noticias/index'))->name('institucion.noticias');
    Route::get('/mensajes',              fn () => Inertia::render('Mensajes/index'))->name('mensajes.index');
    Route::get('/estudiantes',  fn () => Inertia::render('Estudiantes/index'))->name('estudiantes.index');
    Route::get('/docentes',     fn () => Inertia::render('Docentes/index'))->name('docentes.index');
    Route::get('/niveles',      fn () => Inertia::render('Niveles/index'))->name('niveles.index');
    Route::get('/grados',       fn () => Inertia::render('Grados/index'))->name('grados.index');
    Route::get('/secciones',    fn () => Inertia::render('Secciones/index'))->name('secciones.index');
    Route::get('/cursos',       fn () => Inertia::render('Cursos/index'))->name('cursos.index');
    Route::get('/pagos',      fn () => Inertia::render('Pagos/index'))->name('pagos.index');
    Route::get('/matriculas',                                        fn () => Inertia::render('Matricula/index'))->name('matriculas.index');
    Route::get('/matriculas/gestion',                               fn () => Inertia::render('Matricula/Gestion'))->name('matriculas.gestion');
    Route::get('/matriculas/gestion/{aperturaId}/nivel/{nivelId}',  fn (int $aperturaId, int $nivelId) => Inertia::render('Matricula/NivelEstudiantes', [
        'aperturaId' => $aperturaId,
        'nivelId'    => $nivelId,
    ]))->name('matriculas.nivel');
    Route::get('/cursos/{id}/contenido',  fn (int $id) => Inertia::render('CursoContenido/index', ['cursoId' => $id]))->name('cursos.contenido');
    Route::get('/examenes',               fn () => Inertia::render('Examenes/index'))->name('examenes.index');
    Route::get('/examenes/{id}/resolver', fn (int $id, Request $request) => Inertia::render('Examenes/Resolver', [
        'actividadId' => $id,
        'estudianteId' => $request->user()->id 
    ]))->name('examenes.resolver');

    Route::prefix('alumno')->name('alumno.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Alumno/Dashboard'))->name('dashboard');
        Route::get('/cursos',    fn () => Inertia::render('Alumno/Cursos/index'))->name('cursos.index');
        Route::get('/cursos/{id}', fn (int $id) => Inertia::render('Alumno/Cursos/Detalle', ['cursoId' => $id]))->name('cursos.detalle');
        Route::get('/clase/{id}', fn (int $id) => Inertia::render('Alumno/Clases/Ver', ['claseId' => $id]))->name('clase.ver');
        Route::get('/notas',     fn () => Inertia::render('Alumno/Notas/index'))->name('notas.index');
    });

    Route::prefix('docente')->name('docente.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Docente/Dashboard'))->name('dashboard');
        Route::get('/mis-cursos', fn () => Inertia::render('Docente/MisCursos'))->name('mis-cursos.index');
        Route::get('/cursos/{id}/contenido', fn (int $id) => Inertia::render('Docente/Contenido/Editor', ['docenteCursoId' => $id]))->name('cursos.contenido');
        Route::get('/cursos/{id}/asistencia', fn (int $id) => Inertia::render('Docente/Asistencia/PasarLista', ['docenteCursoId' => $id]))->name('cursos.asistencia');
    });

    Route::prefix('padre')->name('padre.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('Padre/Dashboard'))->name('dashboard');
        Route::get('/hijo/{id}', fn (int $id) => Inertia::render('Padre/HijoDetalle', ['hijoId' => $id]))->name('hijo.detalle');
    });

    Route::prefix('mensajeria')->name('mensajeria.')->group(function () {
        Route::get('/', fn () => Inertia::render('Mensajeria/index'))->name('index');
        Route::get('/ver/{id}', fn (int $id) => Inertia::render('Mensajeria/Ver', ['mensajeId' => $id]))->name('ver');
    });

    Route::prefix('comunicados')->name('comunicados.')->group(function () {
        Route::get('/', fn () => Inertia::render('Mensajes/index'))->name('index');
    });


    Route::get('/biblioteca', fn () => Inertia::render('Medios/index'))->name('medios.index');
    Route::get('/asistencia', fn () => Inertia::render('Asistencia/index'))->name('asistencia.index');
    Route::get('/asistencia/scanner', fn () => Inertia::render('Asistencia/Scanner'))->name('asistencia.scanner');

    Route::get('/horarios',               fn () => Inertia::render('Horarios/index'))->name('horarios.index');
    Route::get('/secciones/{seccionId}/horarios', fn (int $seccionId) => Inertia::render('Secciones/HorariosPage', ['seccionId' => $seccionId]))->name('secciones.horarios');
    Route::get('/notas',                  fn () => Inertia::render('Notas/index'))->name('notas.index');
    Route::get('/usuarios',               fn () => Inertia::render('Usuarios/index'))->name('usuarios.index');
});

require __DIR__.'/settings.php';
