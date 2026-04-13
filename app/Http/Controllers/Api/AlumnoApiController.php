<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActividadCurso;
use App\Models\DocenteCurso;
use App\Models\Matricula;
use App\Models\NotaActividad;
use App\Models\Unidad;
use App\Models\Clase;
use App\Models\Estudiante;
use Illuminate\Http\Request;

class AlumnoApiController extends Controller
{
    /**
     * Data for the student dashboard.
     */
    public function dashboard(Request $request)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'No se encontró perfil de estudiante.'], 404);
        }

        $matricula = Matricula::where('estu_id', $estudiante->estu_id)
            ->where('estado', '1')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$matricula) {
            return response()->json(['message' => 'No se encontró matrícula activa.'], 404);
        }

        $seccionId = $matricula->seccion_id;
        $aperturaId = $matricula->apertura_id;

        // Active courses for this section
        $cursosCount = DocenteCurso::where('seccion_id', $seccionId)
            ->where('apertura_id', $aperturaId)
            ->count();

        // Next pending activities
        $proximasActividades = ActividadCurso::where('fecha_cierre', '>', now())
            ->whereHas('clase.unidad', function ($q) use ($seccionId, $aperturaId) {
                // Filter by section and period logic if needed
            })
            ->orderBy('fecha_cierre', 'asc')
            ->limit(5)
            ->get();

        // Recent grades
        $ultimasNotas = NotaActividad::where('estu_id', $estudiante->estu_id)
            ->with('actividad')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Section schedules (Images)
        $horarios = \DB::table('seccion_horarios')
            ->where('seccion_id', $matricula->seccion)
            ->get();

        // Pending Exams and Questionnaires (Tipo 2=Examen, 3=Cuestionario)
        $examenes = ActividadCurso::whereIn('id_tipo_actividad', [2, 3])
            ->where('fecha_cierre', '>', now())
            ->orderBy('fecha_cierre', 'asc')
            ->get();

        // Institutional News (from Blog)
        $noticias = \DB::table('institucion_blog')
            ->where('blo_estatus', '1')
            ->orderBy('blo_fecha', 'desc')
            ->limit(3)
            ->get();

        // Personal Media (Digital Library)
        $biblioteca = \DB::table('mis_medios')
            ->where('user_id', $userId)
            ->get();

        // Summary Metrics
        $asistencias = \App\Models\AsistenciaAlumno::where('id_estudiante', $estudiante->estu_id)->get();
        $totalSesiones = $asistencias->count();
        $presentes = $asistencias->where('estado', 'P')->count();
        $porcentajeAsistencia = $totalSesiones > 0 ? round(($presentes / $totalSesiones) * 100) : 100;

        $todasLasNotas = NotaActividad::where('estu_id', $estudiante->estu_id)
            ->whereNotNull('nota')
            ->where('nota', '!=', '')
            ->pluck('nota')
            ->map(fn($n) => is_numeric($n) ? floatval($n) : 0);
        
        $promedioGeneral = $todasLasNotas->count() > 0 ? round($todasLasNotas->avg(), 1) : 0;

        return response()->json([
            'resumen' => [
                'cursos' => $cursosCount,
                'pendientes' => count($proximasActividades),
                'asistencia' => $porcentajeAsistencia,
                'promedio' => $promedioGeneral,
            ],
            'actividades' => $proximasActividades,
            'notas' => $ultimasNotas,
            'matricula' => $matricula,
            'horarios' => $horarios,
            'examenes' => $examenes,
            'noticias' => $noticias,
            'biblioteca' => $biblioteca,
        ]);
    }

    /**
     * List courses for the student.
     */
    public function cursos(Request $request)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();

        $matricula = Matricula::where('estu_id', $estudiante?->estu_id)
            ->where('estado', '1')
            ->first();

        if (!$matricula) return response()->json([]);

        $docenteCursos = DocenteCurso::where('seccion_id', $matricula->seccion_id)
            ->where('apertura_id', $matricula->apertura_id)
            ->with(['curso', 'docente.perfil'])
            ->get();

        return response()->json($docenteCursos);
    }

    /**
     * Details of a course: units and their classes.
     */
    public function cursoDetalle(Request $request, int $docenteCursoId)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();
        
        $dc = DocenteCurso::with('curso')->find($docenteCursoId);
        
        // Si no se encuentra por PK, tal vez nos enviaron el curso_id
        if (!$dc && $estudiante) {
            $matricula = Matricula::where('estu_id', $estudiante->estu_id)->where('estado', '1')->first();
            if ($matricula) {
                $dc = DocenteCurso::with('curso')
                    ->where('curso_id', $docenteCursoId)
                    ->where('seccion_id', $matricula->seccion_id)
                    ->where('apertura_id', $matricula->apertura_id)
                    ->first();
            }
        }

        if (!$dc) return response()->json(['message' => 'Curso no encontrado o no matriculado.'], 404);

        $unidades = Unidad::where('curso_id', $dc->curso_id)
            ->with([
                'clases' => function ($q) {
                    $q->orderBy('orden')
                      ->with(['archivos', 'actividades.tipoActividad']);
                }
            ])
            ->orderBy('orden')
            ->get();

        // Cruzar con notas del alumno para ver entregas
        if ($estudiante) {
            $unidades->each(function($u) use ($estudiante) {
                $u->clases->each(function($c) use ($estudiante) {
                    $c->actividades->each(function($act) use ($estudiante) {
                        $nota = NotaActividad::where('actividad_id', $act->actividad_id)
                            ->where('estu_id', $estudiante->estu_id)
                            ->first();
                        $act->nota = $nota?->nota;
                        $act->entregado = !empty($nota?->archivo_entrega);
                        $act->fecha_entrega = $nota?->fecha_entrega;
                    });
                });
            });
        }

        $anuncios = \App\Models\Anuncio::where('docente_curso_id', $docenteCursoId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'curso'    => $dc->curso,
            'unidades' => $unidades,
            'anuncios' => $anuncios,
        ]);
    }

    /**
     * Details of a class: materials and activities.
     */
    public function claseDetalle(Request $request, int $claseId)
    {
        $clase = Clase::where('clase_id', $claseId)
            ->with(['unidad.curso', 'archivos', 'actividades.tipoActividad'])
            ->firstOrFail();

        // Encontrar el docen_curso_id para este alumno y este curso para facilitar la navegación de regreso
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();
        $matricula = $estudiante ? Matricula::where('estu_id', $estudiante->estu_id)->where('estado', '1')->first() : null;
        
        $docenCursoId = null;
        if ($matricula) {
            $docenCursoId = DocenteCurso::where('curso_id', $clase->unidad->curso_id)
                ->where('seccion_id', $matricula->seccion_id)
                ->where('apertura_id', $matricula->apertura_id)
                ->value('docen_curso_id');
        }

        $clase->docen_curso_id = $docenCursoId;

        return response()->json($clase);
    }

    /**
     * Submit an activity (file upload).
     */
    public function entregarActividad(Request $request, int $actividadId)
    {
        $request->validate([
            'archivo' => 'required|file|max:10240',
        ]);

        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->firstOrFail();

        $path = $request->file('archivo')->store('entregas_actividades', 'public');

        NotaActividad::updateOrCreate(
            ['actividad_id' => $actividadId, 'estu_id' => $estudiante->estu_id],
            ['archivo_entrega' => $path, 'fecha_entrega' => now()]
        );

        return response()->json(['message' => 'Entregado con éxito.']);
    }

    /**
     * Get attendance history for the logged-in student.
     */
    public function asistencia(Request $request)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'No se encontró perfil de estudiante.'], 404);
        }

        $mes = $request->query('mes');
        $anio = $request->query('anio');

        $query = \App\Models\Asistencia::where('id_persona', $estudiante->estu_id)
            ->where('tipo', 'E')
            ->orderBy('fecha', 'desc');

        if ($mes) {
            $query->whereMonth('fecha', $mes);
        }
        if ($anio) {
            $query->whereYear('fecha', $anio);
        }

        $logs = $query->limit(50)->get();

        return response()->json($logs);
    }

    /**
     * List teachers assigned to the student's current courses.
     */
    public function profesores(Request $request)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'No se encontró perfil de estudiante.'], 404);
        }

        $matricula = Matricula::where('estu_id', $estudiante->estu_id)
            ->where('estado', '1')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$matricula) {
            return response()->json(['message' => 'No se encontró matrícula activa.'], 404);
        }

        $profesores = DocenteCurso::where('seccion_id', $matricula->seccion_id)
            ->where('apertura_id', $matricula->apertura_id)
            ->with(['docente.perfil', 'curso'])
            ->get()
            ->map(function ($dc) {
                $perfil = $dc->docente->perfil;
                return [
                    'docente_id'   => $dc->docente_id,
                    'nombres'      => trim(($perfil->primer_nombre ?? '') . ' ' . ($perfil->segundo_nombre ?? '')),
                    'apellidos'    => trim(($perfil->apellido_paterno ?? '') . ' ' . ($perfil->apellido_materno ?? '')),
                    'especialidad' => $dc->docente->especialidad ?? '—',
                    'telefono'     => $perfil->telefono ?? '—',
                    'curso'        => $dc->curso->nombre ?? '—',
                    'foto'         => $perfil?->foto_perfil ? asset('storage/' . $perfil->foto_perfil) : null,
                    'email'        => $dc->docente->user?->email ?? '—',
                ];
            });

        return response()->json($profesores);
    }
    /**
     * Get attendance history for a specific course for the student.
     */
    public function cursoAsistencia(int $docenteCursoId)
    {
        $userId = auth()->id();
        $estudiante = Estudiante::where('user_id', $userId)->firstOrFail();
        $dc = DocenteCurso::findOrFail($docenteCursoId);

        // Get all academic sessions (clases) for this course
        $clasesIds = \App\Models\Clase::whereHas('unidad', function($q) use ($dc) {
                $q->where('curso_id', $dc->curso_id);
            })->pluck('clase_id');

        // Find attendance sessions for these classes
        $sesiones = \App\Models\AsistenciaActividad::whereIn('id_clase_curso', $clasesIds)
            ->with(['clase'])
            ->orderBy('fecha', 'desc')
            ->get();

        $marcas = \App\Models\AsistenciaAlumno::whereIn('id_asistencia_clase', $sesiones->pluck('id'))
            ->where('id_estudiante', $estudiante->estu_id)
            ->get();

        $history = $sesiones->map(function($s) use ($marcas) {
            $marca = $marcas->where('id_asistencia_clase', $s->id)->first();
            return [
                'sesion_id' => $s->id,
                'clase_titulo' => $s->clase?->titulo ?? 'Sesión Sin Título',
                'fecha' => $s->fecha,
                'estado' => $marca?->estado ?? '—', // P, F, J, T or null
            ];
        });

        return response()->json($history);
    }
}
