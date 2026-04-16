<?php

namespace App\Services\Notifications;

use App\Models\ActividadCurso;
use App\Models\Anuncio;
use App\Models\AsistenciaAlumno;
use App\Models\Docente;
use App\Models\DocenteCurso;
use App\Models\Estudiante;
use App\Models\Matricula;
use App\Models\MensajePrivado;
use App\Models\NotaActividad;
use App\Models\Pago;
use App\Models\PadreApoderado;
use App\Models\PagoNotifica;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Support\Carbon;

class NotificationService
{
    // ── Shared: mensajes privados sin leer ───────────────────────────────────
    private function mensajesSinLeer(User $user): array
    {
        $count = MensajePrivado::where('destinatario_id', $user->id)
            ->where('leido_destinatario', false)
            ->where('eliminado_destinatario', false)
            ->count();

        if ($count === 0) return [];

        return [[
            'id'      => 'mensajes_sin_leer',
            'type'    => 'info',
            'title'   => 'Mensajes sin leer',
            'message' => "Tienes {$count} mensaje" . ($count > 1 ? 's' : '') . " sin leer.",
            'link'    => '/mensajeria',
        ]];
    }

    // ── Estudiante ────────────────────────────────────────────────────────────
    public function forEstudiante(User $user): array
    {
        $estudiante = Estudiante::where('user_id', $user->id)->first();
        if (!$estudiante) return [];

        $matricula = Matricula::where('estu_id', $estudiante->estu_id)
            ->where('estado', '1')
            ->orderBy('created_at', 'desc')
            ->first();

        $notifications = $this->mensajesSinLeer($user);

        if (!$matricula) return $notifications;

        // Cursos del alumno
        $docenteCursos = DocenteCurso::where('seccion_id', $matricula->seccion_id)
            ->where('apertura_id', $matricula->apertura_id)
            ->with('curso')
            ->get();

        $cursoIds = $docenteCursos->pluck('curso_id');
        $now      = Carbon::now();
        $en3dias  = $now->copy()->addDays(3);

        // Actividades del alumno (sin entrega)
        $actividades = ActividadCurso::whereIn('id_curso', $cursoIds)
            ->where('es_calificado', '1')
            ->where('fecha_cierre', '>=', $now)
            ->with('clase.unidad.curso')
            ->get();

        $entregadas = NotaActividad::where('estu_id', $estudiante->estu_id)
            ->where(function ($q) {
                $q->whereNotNull('archivo_entrega')->orWhereNotNull('nota');
            })
            ->pluck('actividad_id')
            ->toArray();

        foreach ($actividades as $act) {
            if (in_array($act->actividad_id, $entregadas)) continue;

            $cierre    = Carbon::parse($act->fecha_cierre);
            $curso     = $act->clase?->unidad?->curso?->nombre ?? 'un curso';
            $inicio    = Carbon::parse($act->fecha_inicio);
            $esNueva   = $inicio->greaterThanOrEqualTo($now->copy()->subHours(24));
            $venceHoy  = $cierre->isToday();
            $vence3d   = $cierre->between($now, $en3dias);

            if ($venceHoy) {
                $notifications[] = [
                    'id'      => 'vence_hoy_' . $act->actividad_id,
                    'type'    => 'error',
                    'title'   => '⚠️ Vence hoy',
                    'message' => "Tu {$act->nombre_actividad} en {$curso} termina hoy.",
                    'link'    => '/alumno/cursos',
                ];
            } elseif ($vence3d) {
                $dias = $now->diffInDays($cierre);
                $notifications[] = [
                    'id'      => 'vence_pronto_' . $act->actividad_id,
                    'type'    => 'warning',
                    'title'   => 'Vence en ' . $dias . ' día' . ($dias > 1 ? 's' : ''),
                    'message' => "{$act->nombre_actividad} en {$curso} vence el {$cierre->format('d/m')}.",
                    'link'    => '/alumno/cursos',
                ];
            } elseif ($esNueva) {
                $notifications[] = [
                    'id'      => 'nueva_act_' . $act->actividad_id,
                    'type'    => 'info',
                    'title'   => 'Nueva actividad',
                    'message' => "Nueva tarea en {$curso}: {$act->nombre_actividad}. Vence {$cierre->format('d/m')}.",
                    'link'    => '/alumno/cursos',
                ];
            }
        }

        // Notas nuevas de hoy
        $notasHoy = NotaActividad::where('estu_id', $estudiante->estu_id)
            ->whereNotNull('nota')
            ->whereDate('fecha_calificacion', $now->toDateString())
            ->with('actividad.clase.unidad.curso')
            ->get();

        foreach ($notasHoy as $nota) {
            $curso = $nota->actividad?->clase?->unidad?->curso?->nombre ?? 'un curso';
            $notifications[] = [
                'id'      => 'nota_nueva_' . $nota->id,
                'type'    => 'success',
                'title'   => 'Nueva calificación',
                'message' => "Tienes nota en {$curso}: {$nota->nota}.",
                'link'    => '/alumno/notas',
            ];
        }

        // Anuncios nuevos de hoy
        $docenteCursoIds = $docenteCursos->pluck('docen_curso_id');
        $anuncios = Anuncio::whereIn('docente_curso_id', $docenteCursoIds)
            ->whereDate('created_at', $now->toDateString())
            ->with('docenteCurso.curso')
            ->get();

        foreach ($anuncios as $anuncio) {
            $curso = $anuncio->docenteCurso?->curso?->nombre ?? 'un curso';
            $notifications[] = [
                'id'      => 'anuncio_' . $anuncio->id,
                'type'    => 'info',
                'title'   => 'Nuevo anuncio',
                'message' => "Anuncio en {$curso}: {$anuncio->titulo}.",
                'link'    => '/alumno/cursos',
            ];
        }

        return $notifications;
    }

    // ── Padre ─────────────────────────────────────────────────────────────────
    public function forPadre(User $user): array
    {
        $padre = PadreApoderado::where('user_id', $user->id)->first();
        if (!$padre) return [];

        $hijos = $padre->estudiantes()->with('perfil')->get();
        if ($hijos->isEmpty()) return $this->mensajesSinLeer($user);

        $hijosIds = $hijos->pluck('estu_id')->toArray();
        $notifications = $this->mensajesSinLeer($user);
        $now = Carbon::now();
        $en3d = $now->copy()->addDays(3);
        $todayStr = $now->toDateString();

        // 1. Batch fetch Matriculas
        $matriculas = Matricula::whereIn('estu_id', $hijosIds)
            ->where('estado', '1')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('estu_id');

        // Collect parameters for further batch fetching
        $seccionAperturaPairs = [];
        foreach ($matriculas as $estuId => $mats) {
            $m = $mats->first();
            $seccionAperturaPairs[] = ['seccion_id' => $m->seccion_id, 'apertura_id' => $m->apertura_id];
        }

        // 2. Batch fetch DocenteCursos
        $allDocenteCursos = collect();
        if (!empty($seccionAperturaPairs)) {
            $docenteCursosQuery = DocenteCurso::query();
            foreach ($seccionAperturaPairs as $pair) {
                $docenteCursosQuery->orWhere(function ($q) use ($pair) {
                    $q->where('seccion_id', $pair['seccion_id'])->where('apertura_id', $pair['apertura_id']);
                });
            }
            $allDocenteCursos = $docenteCursosQuery->with('curso')->get();
        }
        $docenteCursosByPair = $allDocenteCursos->groupBy(fn($dc) => "{$dc->seccion_id}_{$dc->apertura_id}");

        // 3. Batch fetch Entregadas
        $allEntregadas = NotaActividad::whereIn('estu_id', $hijosIds)
            ->where(function ($q) {
                $q->whereNotNull('archivo_entrega')->orWhereNotNull('nota');
            })
            ->get()
            ->groupBy('estu_id');

        // 4. Batch fetch Activities (Unique cursos)
        $allCursoIds = $allDocenteCursos->pluck('curso_id')->unique();
        $allActividades = ActividadCurso::whereIn('id_curso', $allCursoIds)
            ->where('es_calificado', '1')
            ->where('fecha_cierre', '>=', $now)
            ->with('clase.unidad.curso')
            ->get()
            ->groupBy('id_curso');

        // 5. Batch fetch Attendance
        $faltasHoy = AsistenciaAlumno::whereIn('id_estudiante', $hijosIds)
            ->where('estado', 'F')
            ->whereDate('created_at', $todayStr)
            ->get()
            ->groupBy('id_estudiante');

        // 6. Batch fetch New Grades
        $notasNuevas = NotaActividad::whereIn('estu_id', $hijosIds)
            ->whereNotNull('nota')
            ->whereDate('fecha_calificacion', $todayStr)
            ->with('actividad.clase.unidad.curso')
            ->get()
            ->groupBy('estu_id');

        // 7. Batch fetch Announcements
        $allDcIds = $allDocenteCursos->pluck('docen_curso_id')->unique();
        $anunciosHoy = Anuncio::whereIn('docente_curso_id', $allDcIds)
            ->whereDate('created_at', $todayStr)
            ->with('docenteCurso.curso')
            ->get()
            ->groupBy('docente_curso_id');

        // Now process each child using the pre-fetched data
        foreach ($hijos as $hijo) {
            $estuId = $hijo->estu_id;
            $nombre = $hijo->perfil?->primer_nombre ?? 'Tu hijo';

            $matricula = $matriculas->get($estuId)?->first();
            if (!$matricula) continue;

            $pairKey = "{$matricula->seccion_id}_{$matricula->apertura_id}";
            $hijoDocenteCursos = $docenteCursosByPair->get($pairKey, collect());
            $hijoCursoIds = $hijoDocenteCursos->pluck('curso_id');
            $hijoDcIds = $hijoDocenteCursos->pluck('docen_curso_id');

            $hijoEntregadasIds = $allEntregadas->get($estuId, collect())->pluck('actividad_id')->toArray();

            foreach ($hijoCursoIds as $cursoId) {
                $cursoActividades = $allActividades->get($cursoId, collect());
                foreach ($cursoActividades as $act) {
                    if (in_array($act->actividad_id, $hijoEntregadasIds)) continue;

                    $cierre = Carbon::parse($act->fecha_cierre);
                    $cursoNombre = $act->clase?->unidad?->curso?->nombre ?? 'un curso';
                    $inicio = Carbon::parse($act->fecha_inicio);
                    $esNueva = $inicio->greaterThanOrEqualTo($now->copy()->subHours(24));

                    if ($cierre->isToday()) {
                        $notifications[] = [
                            'id'      => "hijo_vence_hoy_{$estuId}_{$act->actividad_id}",
                            'type'    => 'error',
                            'title'   => "⚠️ {$nombre} — vence hoy",
                            'message' => "Recuerda que {$nombre} tiene {$act->nombre_actividad} sin resolver que termina hoy.",
                            'link'    => "/padre/hijo/{$estuId}",
                        ];
                    } elseif ($cierre->between($now, $en3d)) {
                        $dias = $now->diffInDays($cierre, false);
                        if ($dias < 0) $dias = 0;
                        $notifications[] = [
                            'id'      => "hijo_vence_pronto_{$estuId}_{$act->actividad_id}",
                            'type'    => 'warning',
                            'title'   => "{$nombre} — vence en {$dias} día" . ($dias != 1 ? 's' : ''),
                            'message' => "{$nombre} tiene {$act->nombre_actividad} en {$cursoNombre} que vence el {$cierre->format('d/m')}.",
                            'link'    => "/padre/hijo/{$estuId}",
                        ];
                    } elseif ($esNueva) {
                        $notifications[] = [
                            'id'      => "hijo_nueva_act_{$estuId}_{$act->actividad_id}",
                            'type'    => 'info',
                            'title'   => "{$nombre} — nueva tarea",
                            'message' => "{$nombre} tiene nueva tarea en {$cursoNombre}: {$act->nombre_actividad}. Inicia {$inicio->format('d/m')} — vence {$cierre->format('d/m')}.",
                            'link'    => "/padre/hijo/{$estuId}",
                        ];
                    }
                }
            }

            // Faltas
            $numFaltas = $faltasHoy->get($estuId, collect())->count();
            if ($numFaltas > 0) {
                $notifications[] = [
                    'id'      => "falta_hoy_{$estuId}",
                    'type'    => 'warning',
                    'title'   => "{$nombre} — falta registrada",
                    'message' => "{$nombre} tiene {$numFaltas} falta" . ($numFaltas > 1 ? 's' : '') . " registrada" . ($numFaltas > 1 ? 's' : '') . " hoy.",
                    'link'    => '/padre/asistencia',
                ];
            }

            // Notas
            $hijoNotas = $notasNuevas->get($estuId, collect());
            foreach ($hijoNotas as $nota) {
                $cursoNombre = $nota->actividad?->clase?->unidad?->curso?->nombre ?? 'un curso';
                $notifications[] = [
                    'id'      => "hijo_nota_{$estuId}_{$nota->id}",
                    'type'    => 'success',
                    'title'   => "{$nombre} — nueva calificación",
                    'message' => "{$nombre} tiene nota en {$cursoNombre}: {$nota->nota}.",
                    'link'    => "/padre/hijo/{$estuId}",
                ];
            }

            // Anuncios
            foreach ($hijoDcIds as $dcId) {
                $dcAnuncios = $anunciosHoy->get($dcId, collect());
                foreach ($dcAnuncios as $anuncio) {
                    $cursoNombre = $anuncio->docenteCurso?->curso?->nombre ?? 'un curso';
                    $notifications[] = [
                        'id'      => "hijo_anuncio_{$estuId}_{$anuncio->id}",
                        'type'    => 'info',
                        'title'   => "{$nombre} — nuevo anuncio",
                        'message' => "Anuncio en {$cursoNombre} de {$nombre}: {$anuncio->titulo}.",
                        'link'    => "/padre/hijo/{$estuId}",
                    ];
                }
            }
        }

        // Pagos pendientes
        $pagosPendientes = Pago::whereHas('contacto', fn($q) => $q->where('user_id', $user->id))
            ->where('estatus', 0)
            ->count();

        if ($pagosPendientes > 0) {
            $notifications[] = [
                'id'      => 'pagos_pendientes',
                'type'    => 'warning',
                'title'   => 'Pagos pendientes',
                'message' => "Tienes {$pagosPendientes} pago" . ($pagosPendientes > 1 ? 's' : '') . " pendiente" . ($pagosPendientes > 1 ? 's' : '') . ".",
                'link'    => '/padre/pagos',
            ];
        }

        return $notifications;
    }

    // ── Docente ───────────────────────────────────────────────────────────────
    public function forDocente(User $user): array
    {
        $docente = Docente::where('id_usuario', $user->id)->first();
        if (!$docente) return [];

        $notifications = $this->mensajesSinLeer($user);
        $now = Carbon::now();

        $docenteCursos = DocenteCurso::where('docente_id', $docente->docente_id)
            ->with('curso')
            ->get();

        $cursoIds = $docenteCursos->pluck('curso_id');

        // Actividades calificables vencidas sin calificar
        $actividadesVencidas = ActividadCurso::whereIn('id_curso', $cursoIds)
            ->where('es_calificado', '1')
            ->where('fecha_cierre', '<', $now)
            ->with('clase.unidad.curso')
            ->get();

        foreach ($actividadesVencidas as $act) {
            $sinCalificar = NotaActividad::where('actividad_id', $act->actividad_id)
                ->whereNull('nota')
                ->whereNotNull('archivo_entrega')
                ->count();

            if ($sinCalificar > 0) {
                $curso = $act->clase?->unidad?->curso?->nombre ?? 'un curso';
                $notifications[] = [
                    'id'      => 'sin_calificar_' . $act->actividad_id,
                    'type'    => 'warning',
                    'title'   => 'Entregas por calificar',
                    'message' => "{$sinCalificar} entrega" . ($sinCalificar > 1 ? 's' : '') . " pendiente" . ($sinCalificar > 1 ? 's' : '') . " en {$act->nombre_actividad} ({$curso}).",
                    'link'    => '/docente/mis-cursos',
                ];
            }
        }

        // Anuncios publicados hoy
        $dcIds = $docenteCursos->pluck('docen_curso_id');
        $anunciosHoy = Anuncio::whereIn('docente_curso_id', $dcIds)
            ->whereDate('created_at', $now->toDateString())
            ->with('docenteCurso.curso')
            ->get();

        foreach ($anunciosHoy as $anuncio) {
            $curso = $anuncio->docenteCurso?->curso?->nombre ?? 'un curso';
            $notifications[] = [
                'id'      => 'docente_anuncio_' . $anuncio->id,
                'type'    => 'success',
                'title'   => 'Anuncio publicado',
                'message' => "Tu anuncio {$anuncio->titulo} fue publicado en {$curso}.",
                'link'    => '/docente/mis-cursos',
            ];
        }

        return $notifications;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    public function forAdmin(User $user, int $instiId): array
    {
        $notifications = $this->mensajesSinLeer($user);
        $now = Carbon::now();

        // Vouchers pendientes
        $vouchers = PagoNotifica::where('estado', 'pendiente')->count();
        if ($vouchers > 0) {
            $notifications[] = [
                'id'      => 'vouchers_pendientes',
                'type'    => 'warning',
                'title'   => 'Vouchers por validar',
                'message' => "Hay {$vouchers} comprobante" . ($vouchers > 1 ? 's' : '') . " pendiente" . ($vouchers > 1 ? 's' : '') . " de validar.",
                'link'    => '/pagos',
            ];
        }

        // Matrículas del día
        $matriculasHoy = Matricula::whereHas('apertura', fn($q) => $q->where('insti_id', $instiId))
            ->whereDate('created_at', $now->toDateString())
            ->count();
        if ($matriculasHoy > 0) {
            $notifications[] = [
                'id'      => 'matriculas_hoy',
                'type'    => 'info',
                'title'   => 'Nuevas matrículas',
                'message' => "Hoy se registraron {$matriculasHoy} nueva" . ($matriculasHoy > 1 ? 's' : '') . " matrícula" . ($matriculasHoy > 1 ? 's' : '') . ".",
                'link'    => '/matriculas/gestion',
            ];
        }

        // Cumpleaños
        $birthdays = Perfil::whereHas('user', fn($q) => $q->where('insti_id', $instiId))
            ->whereMonth('fecha_nacimiento', $now->month)
            ->whereDay('fecha_nacimiento', $now->day)
            ->get();
        if ($birthdays->isNotEmpty()) {
            $names = $birthdays->map(fn($p) => "{$p->primer_nombre} {$p->apellido_paterno}")->take(3)->join(', ');
            $extra = $birthdays->count() > 3 ? ' y ' . ($birthdays->count() - 3) . ' más' : '';
            $notifications[] = [
                'id'      => 'birthdays',
                'type'    => 'success',
                'title'   => 'Cumpleaños de hoy',
                'message' => "Hoy cumplen años: {$names}{$extra}.",
                'link'    => '/estudiantes',
            ];
        }

        // Pagos pendientes
        $pagos = Pago::where('insti_id', $instiId)->where('estatus', 0)->count();
        if ($pagos > 0) {
            $notifications[] = [
                'id'      => 'pagos_pendientes',
                'type'    => 'warning',
                'title'   => 'Pagos pendientes',
                'message' => "Hay {$pagos} pago" . ($pagos > 1 ? 's' : '') . " pendiente" . ($pagos > 1 ? 's' : '') . " de cobro.",
                'link'    => '/pagos',
            ];
        }

        return $notifications;
    }
}
