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

        // Stats principales
        $stats = [
            'instituciones' => InstitucionEducativa::count(),
            'estudiantes'   => Estudiante::where('insti_id', $instiId)->count(),
            'docentes'      => Docente::where('id_insti', $instiId)->count(),
            'cursos'        => Curso::where('id_insti', $instiId)->where('estado', '1')->count(),
        ];

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

        return response()->json([
            ...$stats,
            'notificaciones'      => $notifications,
            'mensajes_pendientes' => $mensajesDetalle,
        ]);
    }
}
