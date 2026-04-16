<?php

namespace App\Services\Dashboard;

use App\Models\PadreApoderado;
use App\Models\Pago;
use App\Models\AsistenciaAlumno;
use App\Models\User;

class PadreDashboardService
{
    public function getStats(User $user): array
    {
        $padre = PadreApoderado::where('user_id', $user->id)->first();

        if (!$padre) {
            return ['hijos' => [], 'resumen' => [], 'notificaciones' => [], 'mensajes_pendientes' => []];
        }

        $hijos = $padre->estudiantes()->with('perfil')->get();
        $estuIds = $hijos->pluck('estu_id');

        // Pagos recientes de todos los hijos
        $pagosRecientes = Pago::whereIn('estu_id', $estuIds)
            ->orderBy('pag_fecha', 'desc')
            ->limit(5)
            ->get();

        // Asistencia general por hijo
        $asistenciaPorHijo = AsistenciaAlumno::whereIn('id_estudiante', $estuIds)
            ->get()
            ->groupBy('id_estudiante')
            ->map(function ($registros) {
                $total = $registros->count();
                $presentes = $registros->where('estado', 'P')->count();
                return $total > 0 ? round(($presentes / $total) * 100) : 0;
            });

        $hijosData = $hijos->map(function ($h) use ($asistenciaPorHijo) {
            return [
                'estu_id'    => $h->estu_id,
                'nombre'     => $h->perfil?->nombre_ordenado ?? $h->perfil?->primer_nombre,
                'foto'       => $h->foto ? '/storage/' . $h->foto : null,
                'asistencia' => $asistenciaPorHijo[$h->estu_id] ?? 0,
                'perfil'     => $h->perfil,
            ];
        });

        return [
            'hijos'               => $hijosData,
            'total_hijos'         => $hijos->count(),
            'pagos_recientes'     => $pagosRecientes,
            'notificaciones'      => [],
            'mensajes_pendientes' => [],
        ];
    }
}
