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
        if ($user->hasRole('docente')) {
            return redirect()->route('docente.dashboard');
        }
        if ($user->hasRole('estudiante')) {
            return redirect()->route('alumno.dashboard');
        }
        if ($user->hasRole(['padre_familia', 'madre_familia', 'apoderado'])) {
            return redirect()->route('padre.dashboard');
        }
        // administrador y psicologo acceden al dashboard general
        return Inertia::render('Dashboard/index');
    })->name('dashboard');
    Route::get('/institucion',         fn () => Inertia::render('Institucion/index'))->name('institucion.index');
    Route::get('/institucion/galeria',   fn () => Inertia::render('Institucion/Galeria/index'))->name('institucion.galeria');
    Route::get('/institucion/noticias',  fn () => Inertia::render('Institucion/Noticias/index'))->name('institucion.noticias');
    Route::get('/mensajes',              fn () => Inertia::render('Comunicados/index'))->name('mensajes.index');
    Route::get('/estudiantes',  fn () => Inertia::render('GestionAlumnos/index'))->name('estudiantes.index');
    Route::get('/estudiantes/{id}/fotocheck', [\App\Http\Controllers\Admin\FotocheckController::class, 'generate'])->name('estudiantes.fotocheck');
    Route::get('/docentes',     fn () => Inertia::render('GestionDocentes/index'))->name('docentes.index');
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

    Route::prefix('alumno')->name('alumno.')->middleware('check.role:estudiante')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('PortalAlumno/Dashboard'))->name('dashboard');
        Route::get('/cursos',    fn () => Inertia::render('PortalAlumno/Cursos/index'))->name('cursos.index');
        Route::get('/cursos/{id}', fn (int $id) => Inertia::render('PortalAlumno/Cursos/Detalle', ['cursoId' => $id]))->name('cursos.detalle');
        Route::get('/clase/{id}', fn (int $id) => Inertia::render('PortalAlumno/Clases/Ver', ['claseId' => $id]))->name('clase.ver');
        Route::get('/notas',     fn () => Inertia::render('PortalAlumno/Notas/index'))->name('notas.index');
        Route::get('/puzzles', function () {
            $estuId = auth()->user()->id; // Asumimos que user_id = estu_id por ahora o vinculamos
            $puzzles = DB::table('actividad_curso as ac')
                ->join('imagen_rompecabeza as ir', 'ac.actividad_id', '=', 'ir.actividad_id')
                ->leftJoin('alumno_rompecabeza as ar', function($join) use ($estuId) {
                    $join->on('ac.actividad_id', '=', 'ar.actividad_id')
                         ->where('ar.estu_id', '=', $estuId);
                })
                ->where('ac.id_tipo_actividad', 6) // Tipo Rompecabezas
                ->select('ac.*', 'ir.imagen', 'ar.tiempo', 'ar.intentos', 'ar.ayuda')
                ->get();

            return Inertia::render('PortalAlumno/Puzzles/index', [
                'puzzles' => $puzzles
            ]);
        })->name('puzzles.index');

        Route::get('/puzzles/{id}', function (int $id) {
            $puzzle = DB::table('actividad_curso as ac')
                ->join('imagen_rompecabeza as ir', 'ac.actividad_id', '=', 'ir.actividad_id')
                ->where('ac.actividad_id', $id)
                ->select('ac.*', 'ir.imagen')
                ->first();
            
            if (!$puzzle) abort(404);

            return Inertia::render('PortalAlumno/Puzzles/Ver', [
                'puzzle' => $puzzle
            ]);
        })->name('puzzles.ver');
    });

    Route::prefix('docente')->name('docente.')->middleware('check.role:docente')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('PortalDocente/Dashboard'))->name('dashboard');
        Route::get('/mis-cursos', fn () => Inertia::render('PortalDocente/MisCursos'))->name('mis-cursos.index');
        Route::get('/cursos/{id}/contenido', fn (int $id) => Inertia::render('PortalDocente/Contenido/Editor', ['docenteCursoId' => $id]))->name('cursos.contenido');
        Route::get('/cursos/{id}/asistencia', fn (int $id) => Inertia::render('PortalDocente/Asistencia/PasarLista', ['docenteCursoId' => $id]))->name('cursos.asistencia');
        Route::get('/cursos/{id}/cuestionario/{actividadId}', fn (int $id, int $actividadId) => Inertia::render('PortalDocente/Contenido/QuizBuilder', [
            'docenteCursoId' => $id, 
            'actividadId' => $actividadId
        ]))->name('cursos.cuestionario');
        // Módulo de Dibujo (Paint)
    Route::get('/alumno/actividad/{id}/dibujo', function ($id) {
        $actividad = \App\Models\ActividadCurso::find($id);
        return inertia('PortalAlumno/Dibujo', ['actividad' => $actividad]);
    })->name('alumno.dibujo');
});

    Route::prefix('padre')->name('padre.')->middleware('check.role:padre_familia|madre_familia|apoderado')->group(function () {
        Route::get('/dashboard', fn () => inertia('PortalPadre/Dashboard'))->name('dashboard');
        Route::get('/matricula', fn () => inertia('PortalPadre/MatriculaWizard'))->name('matricula.wizard');
        Route::get('/hijo/{id}', fn (int $id) => Inertia::render('Padre/HijoDetalle', ['hijoId' => $id]))->name('hijo.detalle');
    });

    Route::prefix('mensajeria')->name('mensajeria.')->group(function () {
        Route::get('/', fn () => Inertia::render('MensajesPrivados/index'))->name('index');
        Route::get('/ver/{id}', fn (int $id) => Inertia::render('MensajesPrivados/Ver', ['mensajeId' => $id]))->name('ver');
    });

    Route::prefix('comunicados')->name('comunicados.')->group(function () {
        Route::get('/', fn () => Inertia::render('Comunicados/index'))->name('index');
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
