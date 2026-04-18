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
            ->where(function ($q) use ($aperturaId) {
                $q->where('apertura_id', $aperturaId)->orWhereNull('apertura_id');
            })
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
            ->where(function ($q) use ($matricula) {
                $q->where('apertura_id', $matricula->apertura_id)
                  ->orWhereNull('apertura_id');
            })
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
                    ->where(function ($q) use ($matricula) {
                        $q->where('apertura_id', $matricula->apertura_id)->orWhereNull('apertura_id');
                    })
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
                        $act->entregado = $nota && (
                            !empty($nota->archivo_entrega) ||
                            $nota->nota !== null ||
                            $nota->fecha_entrega !== null
                        );
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
                ->where(function ($q) use ($matricula) {
                    $q->where('apertura_id', $matricula->apertura_id)->orWhereNull('apertura_id');
                })
                ->value('docen_curso_id');
        }

        $clase->docen_curso_id = $docenCursoId;

        // Cruzar con notas del alumno para ver entregas
        if ($estudiante) {
            $clase->actividades->each(function($act) use ($estudiante) {
                $nota = \App\Models\NotaActividad::where('actividad_id', $act->actividad_id)
                    ->where('estu_id', $estudiante->estu_id)
                    ->first();
                $act->nota = $nota?->nota;
                $act->entregado = $nota && ($nota->archivo_entrega || $nota->fecha_entrega || $nota->nota !== null);
                $act->fecha_entrega = $nota?->fecha_entrega;

                // Archivos del docente para esta actividad
                $act->archivos_docente = \DB::table('archivos_actividad')
                    ->where('id_actividad', $act->actividad_id)
                    ->where('origen', 'd')
                    ->get()
                    ->map(fn($a) => [
                        'nombre' => $a->nombre_archivo,
                        'url'    => '/storage/' . $a->archivo,
                        'tipo'   => $a->tipo_archivo,
                    ]);

                // Formatos permitidos para entrega
                $act->allowed_formats = $act->allowed_formats
                    ? explode(',', $act->allowed_formats)
                    : ['pdf', 'docx', 'jpg', 'png'];
            });
        }

        return response()->json($clase);
    }

    /**
     * Submit an activity (file upload).
     */
    public function entregarActividad(Request $request, int $actividadId)
    {
        $request->validate([
            'archivo' => 'required|file|max:3072|mimes:pdf,doc,docx,jpg,jpeg,png,gif,webp,xlsx,xls,zip,rar',
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
     * Return the logged-in student's section weekly schedule.
     */
    public function horario(Request $request)
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
            return response()->json(['message' => 'Sin matrícula activa.'], 404);
        }

        $anio = $request->query('anio', date('Y'));

        $clases = \App\Models\HorarioClase::with(['curso', 'docente.perfil', 'aulaObj'])
            ->where('seccion_id', $matricula->seccion_id)
            ->where('anio_escolar', $anio)
            ->where('activo', true)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        $horario = [];
        foreach ($clases as $clase) {
            $dia = $clase->dia_semana;
            if (!isset($horario[$dia])) {
                $horario[$dia] = ['dia' => $clase->nombre_dia, 'clases' => []];
            }
            $horario[$dia]['clases'][] = [
                'id'          => $clase->horario_clase_id,
                'curso'       => $clase->curso->nombre,
                'curso_id'    => $clase->curso_id,
                'docente'     => $clase->docente->nombre_completo,
                'docente_id'  => $clase->docente_id,
                'hora_inicio' => $clase->hora_inicio_formateada,
                'hora_fin'    => $clase->hora_fin_formateada,
                'aula'        => $clase->aulaObj?->nombre ?? $clase->aula,
                'duracion'    => $clase->duracion_minutos,
            ];
        }

        return response()->json([
            'seccion_id' => $matricula->seccion_id,
            'anio'       => (int) $anio,
            'horario'    => $horario,
        ]);
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
            ->where(function ($q) use ($matricula) {
                $q->where('apertura_id', $matricula->apertura_id)->orWhereNull('apertura_id');
            })
            ->with(['docente.perfil', 'curso'])
            ->get()
            ->map(function ($dc) {
                $perfil = $dc->docente->perfil;
                return [
                    'docente_id'   => $dc->docente_id,
                    'user_id'      => $dc->docente->user?->id,
                    'nombres'      => trim(($perfil->primer_nombre ?? '') . ' ' . ($perfil->segundo_nombre ?? '')),
                    'apellidos'    => trim(($perfil->apellido_paterno ?? '') . ' ' . ($perfil->apellido_materno ?? '')),
                    'especialidad' => $dc->docente->especialidad ?? '—',
                    'telefono'     => $perfil->telefono ?? '—',
                    'curso'        => $dc->curso->nombre ?? '—',
                    'docen_curso_id' => $dc->docen_curso_id,
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

    /**
     * Get all grades for the authenticated student.
     */
    public function notas(Request $request)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'No se encontró perfil de estudiante.'], 404);
        }

        // Obtener matrícula activa
        $matricula = Matricula::where('estu_id', $estudiante->estu_id)
            ->where('estado', '1')
            ->first();

        if (!$matricula) {
            return response()->json([]);
        }

        // Obtener cursos del alumno
        $docenteCursos = DocenteCurso::where('seccion_id', $matricula->seccion_id)
            ->where(function ($q) use ($matricula) {
                $q->where('apertura_id', $matricula->apertura_id)->orWhereNull('apertura_id');
            })
            ->with(['curso'])
            ->get();

        // Obtener notas
        $notasRaw = NotaActividad::where('estu_id', $estudiante->estu_id)
            ->with(['actividad.tipoActividad'])
            ->get();

        $resultado = $docenteCursos->map(function ($dc) use ($notasRaw) {
            $curso = $dc->curso;
            
            $notasCurso = $notasRaw->filter(function ($n) use ($curso) {
                return $n->actividad && $n->actividad->id_curso == $curso->curso_id;
            });

            $agrupadoPorTipo = $notasCurso->groupBy(function ($n) {
                return $n->actividad->tipoActividad?->nombre ?? 'Actividad';
            })->map(function ($notas, $tipo) {
                return [
                    'tipo' => $tipo,
                    'items' => $notas->map(function ($n) {
                        return [
                            'id' => $n->id,
                            'nombre' => $n->actividad->nombre_actividad,
                            'nota' => $n->nota,
                            'observacion' => $n->observacion,
                            'fecha' => $n->created_at?->toDateString(),
                        ];
                    })->values()
                ];
            })->values();

            $soloNotas = $notasCurso->pluck('nota')->filter(fn($v) => is_numeric($v));
            $promedio = $soloNotas->count() > 0 ? round($soloNotas->avg(), 1) : null;

            return [
                'curso_id' => $curso->curso_id,
                'nombre_curso' => $curso->nombre,
                'promedio' => $promedio,
                'grupos' => $agrupadoPorTipo
            ];
        });

        return response()->json($resultado);
    }
}
