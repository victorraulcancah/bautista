<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\InstitucionEducativa;
use App\Models\Mensaje;
use App\Models\Matricula;
use App\Models\Pago;
use App\Models\Perfil;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user    = $request->user();
        $instiId = $user->insti_id;

        if ($user->hasRole('docente')) {
            return $this->docenteStats($user);
        }

        if ($user->hasRole('estudiante')) {
            return $this->estudianteStats($user);
        }

        if ($user->hasRole(['padre_familia', 'madre_familia', 'apoderado'])) {
            return $this->padreStats($user);
        }

        // Default: Admin Stats
        return $this->adminStats($user, $instiId);
    }

    private function adminStats($user, $instiId): JsonResponse
    {

        // Notificaciones Pendientes
        $notifications = [];

        // 1. Mensajes sin leer
        $unread = Mensaje::where('destinatario_id', $user->id)->where('leido', false)->count();
        if ($unread > 0) {
            $notifications[] = [
                'id'      => 'unread_msgs',
                'type'    => 'info',
                'title'   => 'Mensajes Pendientes',
                'message' => "Tienes {$unread} mensaje" . ($unread > 1 ? 's' : '') . " sin leer.",
                'link'    => '/mensajeria',
            ];
        }

        // 2. Cumpleaños de hoy
        $birthdays = Perfil::whereHas('user', fn($q) => $q->where('insti_id', $instiId))
            ->whereMonth('fecha_nacimiento', now()->month)
            ->whereDay('fecha_nacimiento', now()->day)
            ->get();

        if ($birthdays->isNotEmpty()) {
            $names = $birthdays->map(fn($p) => "{$p->primer_nombre} {$p->apellido_paterno}")->take(3)->join(', ');
            $extra = $birthdays->count() > 3 ? "... y " . ($birthdays->count() - 3) . " más" : "";
            $notifications[] = [
                'id'      => 'birthdays',
                'type'    => 'success',
                'title'   => 'Cumpleaños de Hoy',
                'message' => "Hoy cumplen años: {$names}{$extra}.",
                'link'    => '/estudiantes', // O una sección de calendario
            ];
        }

        // 3. Pagos por validar
        $pendingPayments = Pago::where('insti_id', $instiId)->where('estatus', 0)->count();
        if ($pendingPayments > 0) {
            $notifications[] = [
                'id'      => 'pending_payments',
                'type'    => 'warning',
                'title'   => 'Pagos Pendientes',
                'message' => "Hay {$pendingPayments} pago" . ($pendingPayments > 1 ? 's' : '') . " esperando validación.",
                'link'    => '/pagos',
            ];
        }

        // 4. Matrículas de hoy
        $todayMatriculas = Matricula::whereHas('apertura', fn($q) => $q->where('insti_id', $instiId))
            ->whereDate('created_at', now()->toDateString())
            ->count();
        if ($todayMatriculas > 0) {
            $notifications[] = [
                'id'      => 'new_matriculas',
                'type'    => 'info',
                'title'   => 'Nuevas Matrículas',
                'message' => "Hoy se han registrado {$todayMatriculas} nuevo" . ($todayMatriculas > 1 ? 's' : '') . " alumno" . ($todayMatriculas > 1 ? 's' : '') . ".",
                'link'    => '/matriculas/gestion',
            ];
        }

        // Listado detallado para la tabla de la imagen (últimos 10 mensajes sin leer)
        $mensajesDetalle = Mensaje::where('destinatario_id', $user->id)
            ->where('leido', false)
            ->with(['remitente.perfil', 'remitente.padre'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($m) {
                // Buscar estudiante asociado si el remitente es un padre
                $studentName = '-';
                if ($m->remitente->padre) {
                    $student = $m->remitente->padre->estudiantes()->first();
                    if ($student && $student->perfil) {
                        $studentName = $student->perfil->nombre_completo;
                    }
                }

                return [
                    'id'            => $m->id,
                    'fecha'         => $m->created_at->format('d/m/Y H:i'),
                    'representante' => $m->remitente->perfil?->nombre_completo ?? $m->remitente->name,
                    'telefono'      => $m->remitente->perfil?->telefono ?? '-',
                    'exalumno'      => $studentName,
                    'asunto'        => $m->asunto,
                ];
            });

        // Estadísticas Globales
        $stats = [
            'instituciones' => InstitucionEducativa::count(),
            'docentes'      => Docente::count(),
            'estudiantes'   => Estudiante::count(),
            'cursos'        => Curso::count(),
        ];

        return response()->json([
            'total_instituciones' => $stats['instituciones'],
            'total_docentes'      => $stats['docentes'],
            'total_estudiantes'   => $stats['estudiantes'],
            'total_cursos'        => $stats['cursos'],
            'notificaciones'      => $notifications,
            'mensajes_pendientes' => $mensajesDetalle,
            'cursos'              => [], // Evitar colisión
            'stats'               => [   // Valores por defecto para el widget de Estudiante
                'tareas_pendientes' => 0,
                'asistencia_perc'   => 0,
                'promedio_general'  => 0
            ],
            'hijos'               => [], // Evitar colisión con widget de Padre
        ]);
    }

    private function docenteStats($user): JsonResponse
    {
        $docente = Docente::where('id_usuario', $user->id)->first();
        if (!$docente) return response()->json(['error' => 'No docente found'], 404);

        $cursosCount = \App\Models\DocenteCurso::where('docente_id', $docente->docente_id)->count();
        $estudiantesCount = \App\Models\Matricula::whereHas('apertura', function($q) use ($user) {
            $q->where('insti_id', $user->insti_id);
        })->count(); // Simplificado para demo, idealmente filtrar por sus cursos

        return response()->json([
            'resumen' => [
                'cursos' => $cursosCount,
                'estudiantes' => $estudiantesCount,
                'pendientes_calificar' => 0
            ],
            'cursos' => \App\Models\DocenteCurso::where('docente_id', $docente->docente_id)
                ->with(['curso', 'seccion.grado'])
                ->get(),
            'notificaciones'      => [],
            'mensajes_pendientes' => [],
        ]);
    }

    private function estudianteStats($user): JsonResponse
    {
        $estudiante = Estudiante::where('user_id', $user->id)->first();
        
        return response()->json([
            'stats' => [
                'tareas_pendientes' => 5,
                'asistencia_perc' => 95,
                'promedio_general' => 17
            ],
            'cursos' => \App\Models\Matricula::where('estu_id', $estudiante?->estu_id ?? 0)
                ->with(['apertura.nivel']) // Simplificado para demo
                ->get(),
            'notificaciones'      => [],
            'mensajes_pendientes' => [],
        ]);
    }

    private function padreStats($user): JsonResponse
    {
        $padre = \App\Models\PadreApoderado::where('user_id', $user->id)->first();
        return response()->json([
            'hijos' => $padre ? $padre->estudiantes()->with('perfil')->get() : [],
            'notificaciones'      => [],
            'mensajes_pendientes' => [],
        ]);
    }
}
