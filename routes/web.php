<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('login'))->name('home');

// ── Rutas públicas ──────────────────────────────────────────────────────
Route::get('/login', fn () => Inertia::render('auth/login'))->name('login');

// ── Rutas protegidas ────────────────────────────────────────────────────
Route::middleware(['auth.token'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard/index');
    })->name('dashboard');

    Route::get('/institucion',         fn () => Inertia::render('Institucion/index'))->middleware('permission:institucion.ver')->name('institucion.index');
    Route::get('/institucion/galeria',   fn () => Inertia::render('Institucion/Galeria/index'))->middleware('permission:institucion.ver')->name('institucion.galeria');
    Route::get('/institucion/noticias',  fn () => Inertia::render('Institucion/Noticias/index'))->middleware('permission:institucion.ver')->name('institucion.noticias');
    Route::get('/institucion/noticias/portada', [\App\Http\Controllers\Admin\NoticiaController::class, 'portada'])->middleware('permission:institucion.ver')->name('institucion.noticias.portada');
    Route::get('/institucion/noticias/diario/{id}', [\App\Http\Controllers\Admin\NoticiaController::class, 'showDiario'])->middleware('permission:institucion.ver')->name('institucion.noticias.diario');
    Route::post('/institucion/noticias/{id}/comentarios', [\App\Http\Controllers\Admin\NoticiaController::class, 'storeComentario'])->middleware('permission:institucion.ver')->name('institucion.noticias.comentarios.store');
    
    Route::get('/mensajes',              fn () => Inertia::render('Comunicados/index'))->middleware('permission:comunicados.ver')->name('mensajes.index');
    
    Route::get('/estudiantes',  fn () => Inertia::render('GestionAlumnos/index'))->middleware('permission:estudiantes.ver')->name('estudiantes.index');
    Route::get('/estudiantes/{id}/fotocheck', [\App\Http\Controllers\Admin\FotocheckController::class, 'generate'])->middleware('permission:estudiantes.ver')->name('estudiantes.fotocheck');
    Route::get('/matriculas/aperturas/{aperturaId}/niveles/{nivelId}/fotochecks', [\App\Http\Controllers\Admin\FotocheckController::class, 'generateBulk'])->middleware('permission:estudiantes.ver')->name('matriculas.fotochecks.bulk');
    
    Route::get('/docentes',     fn () => Inertia::render('GestionDocentes/index'))->middleware('permission:docentes.ver')->name('docentes.index');
    
    Route::get('/niveles',      fn () => Inertia::render('Niveles/index'))->middleware('permission:niveles.ver')->name('niveles.index');
    Route::get('/grados',       fn () => Inertia::render('Grados/index'))->middleware('permission:cursos.ver')->name('grados.index');
    Route::get('/secciones',    fn () => Inertia::render('Secciones/index'))->middleware('permission:secciones.ver')->name('secciones.index');
    Route::get('/cursos',       fn () => Inertia::render('Cursos/index'))->middleware('permission:cursos.ver')->name('cursos.index');
    
    Route::get('/pagos',      fn () => Inertia::render('Pagos/index'))->middleware('permission:pagos.ver')->name('pagos.index');
    
    Route::get('/matriculas',                                        fn () => Inertia::render('Matricula/index'))->middleware('permission:matriculas.ver')->name('matriculas.index');
    Route::get('/matriculas/gestion',                               fn () => Inertia::render('Matricula/Gestion'))->middleware('permission:matriculas.ver')->name('matriculas.gestion');
    Route::get('/matriculas/gestion/{aperturaId}/nivel/{nivelId}',  fn (int $aperturaId, int $nivelId) => Inertia::render('Matricula/NivelEstudiantes', [
        'aperturaId' => $aperturaId,
        'nivelId'    => $nivelId,
    ]))->middleware('permission:matriculas.ver')->name('matriculas.nivel');

    Route::get('/cursos/{id}/contenido',  fn (int $id) => Inertia::render('CursoContenido/index', ['cursoId' => $id]))->middleware('permission:cursos.ver')->name('cursos.contenido');
    Route::get('/cursos/{id}/detalle',    fn (int $id) => redirect()->route('cursos.contenido', ['id' => $id]))->name('cursos.detalle');

    Route::prefix('alumno')->name('alumno.')->middleware('permission:dashboard.resumen.academico')->group(function () {
        Route::get('/dashboard', fn () => redirect()->route('dashboard'))->name('dashboard');
        Route::get('/cursos',    fn () => redirect()->route('cursos.index'))->name('cursos.index');
        Route::get('/cursos/{id}', fn (int $id) => Inertia::render('PortalAlumno/Cursos/Detalle', ['cursoId' => $id]))->name('cursos.detalle');
        Route::get('/clase/{id}', fn (int $id) => Inertia::render('PortalAlumno/Clases/Ver', ['claseId' => $id]))->name('clase.ver');
        Route::get('/notas',     fn () => Inertia::render('PortalAlumno/Notas/index'))->name('notas.index');
        Route::get('/puzzles', function () {
            $estuId = auth()->user()->id;
            $puzzles = DB::table('actividad_curso as ac')
                ->join('imagen_rompecabeza as ir', 'ac.actividad_id', '=', 'ir.actividad_id')
                ->leftJoin('alumno_rompecabeza as ar', function($join) use ($estuId) {
                    $join->on('ac.actividad_id', '=', 'ar.actividad_id')
                         ->where('ar.estu_id', '=', $estuId);
                })
                ->where('ac.id_tipo_actividad', 6)
                ->select('ac.*', 'ir.imagen', 'ar.tiempo', 'ar.intentos', 'ar.ayuda')
                ->get();

            return Inertia::render('Actividades/Puzzles/index', [
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

            return Inertia::render('Actividades/Puzzles/Ver', [
                'puzzle' => $puzzle
            ]);
        })->name('puzzles.ver');

        Route::get('/qr',         fn () => Inertia::render('PortalAlumno/QR'))->middleware('permission:portal.alumno.qr')->name('qr');
        Route::get('/profesores', fn () => Inertia::render('PortalAlumno/Profesores'))->name('profesores');
        Route::get('/asistencia', fn () => Inertia::render('PortalAlumno/Asistencia'))->middleware('permission:portal.alumno.asistencia')->name('asistencia');
    });

    Route::prefix('docente')->name('docente.')->middleware('permission:dashboard.cursos.asignados')->group(function () {
        Route::get('/dashboard', fn () => redirect()->route('dashboard'))->name('dashboard');
        Route::get('/mis-cursos', fn () => redirect()->route('cursos.index'))->name('mis-cursos.index');
        Route::get('/mis-alumnos', [\App\Http\Controllers\DocenteController::class, 'misAlumnos'])->middleware('permission:portal.docente.alumnos')->name('mis-alumnos.index');
        Route::get('/cursos/{id}/contenido', fn (int $id) => Inertia::render('PortalDocente/Contenido/Editor', ['docenteCursoId' => $id]))->name('cursos.contenido');
        Route::get('/cursos/{id}/asistencia', fn (int $id) => Inertia::render('PortalDocente/Asistencia/PasarLista', ['docenteCursoId' => $id]))->name('cursos.asistencia');
        Route::get('/cursos/{id}/cuestionario/{actividadId}', fn (int $id, int $actividadId) => Inertia::render('PortalDocente/Contenido/QuizBuilder', [
            'docenteCursoId' => $id, 
            'actividadId' => $actividadId
        ]))->name('cursos.cuestionario');
        Route::get('/alumno/actividad/{id}/dibujo', function ($id) {
            $actividad = \App\Models\ActividadCurso::find($id);
            return inertia('Actividades/Dibujo', ['actividad' => $actividad]);
        })->name('alumno.dibujo');
    });

    Route::prefix('padre')->name('padre.')->middleware('permission:dashboard.resumen.familiar')->group(function () {
        Route::get('/dashboard', fn () => redirect()->route('dashboard'))->name('dashboard');
        Route::get('/matricula', fn () => inertia('Matricula/Padre/MatriculaWizard'))->name('matricula.wizard');
        Route::get('/hijo/{id}', fn (int $id) => Inertia::render('Matricula/Padre/HijoDetalle', ['hijoId' => $id]))->name('hijo.detalle');
    });

    Route::prefix('mensajeria')->name('mensajeria.')->middleware('permission:mensajeria.ver')->group(function () {
        Route::get('/', fn () => Inertia::render('MensajesPrivados/index'))->name('index');
        Route::get('/ver/{id}', fn (int $id) => Inertia::render('MensajesPrivados/Ver', ['mensajeId' => $id]))->name('ver');
    });

    Route::prefix('comunicados')->name('comunicados.')->middleware('permission:comunicados.ver')->group(function () {
        Route::get('/', fn () => Inertia::render('Comunicados/index'))->name('index');
    });

    Route::get('/biblioteca', fn () => Inertia::render('Medios/index'))->middleware('permission:biblioteca.ver')->name('medios.index');
    Route::get('/asistencia', fn () => Inertia::render('Asistencia/index'))->middleware('permission:asistencia.ver')->name('asistencia.index');
    Route::get('/asistencia/scanner', fn () => Inertia::render('Asistencia/Scanner'))->middleware('permission:asistencia.escanear')->name('asistencia.scanner');

    Route::get('/horarios',               fn () => Inertia::render('Horarios/index'))->middleware('permission:dashboard.resumen.academico')->name('horarios.index');
    Route::get('/secciones/{seccionId}/horarios', fn (int $seccionId) => Inertia::render('Secciones/HorariosPage', ['seccionId' => $seccionId]))->middleware('permission:secciones.ver')->name('secciones.horarios');
    Route::get('/notas',                  fn () => Inertia::render('Notas/index'))->middleware('permission:dashboard.resumen.academico')->name('notas.index');
    Route::get('/usuarios',               fn () => Inertia::render('Usuarios/index'))->middleware('permission:usuarios.ver')->name('usuarios.index');
    Route::get('/roles-permisos',         fn () => Inertia::render('Seguridad/index'))->middleware('permission:roles.editar')->name('seguridad.roles');

    Route::get('/examenes',               fn () => Inertia::render('Examenes/index'))->middleware('permission:dashboard.resumen.academico')->name('examenes.index');
    Route::get('/examenes/{id}/resolver', function (int $id) {
        $estuId = \App\Models\Estudiante::where('user_id', auth()->id())->value('estu_id');
        return Inertia::render('Examenes/Resolver', [
            'actividadId' => $id,
            'estudianteId' => $estuId
        ]);
    })->middleware('permission:dashboard.resumen.academico')->name('examenes.resolver');
});

require __DIR__.'/settings.php';
