<?php

namespace App\Services\Dashboard;

use App\Models\AsistenciaAlumno;
use App\Models\Estudiante;
use App\Models\Matricula;
use App\Models\User;

class EstudianteDashboardService
{
    public function getStats(User $user): array
    {
        $estudiante = Estudiante::where('user_id', $user->id)->first();
        
        if (!$estudiante) {
            return [
                'stats' => [
                    'tareas_pendientes' => 0,
                    'asistencia_perc'   => 0,
                    'promedio_general'  => 0
                ]
            ];
        }

        return [
            'stats' => [
                'tareas_pendientes' => $this->getTareasPendientes($estudiante),
                'asistencia_perc'   => $this->getAsistenciaPercentage($estudiante),
                'promedio_general'  => $this->getPromedioGeneral($estudiante)
            ],
            'cursos' => Matricula::where('estu_id', $estudiante->estu_id)
                ->with(['apertura'])
                ->get(),
            'notificaciones'      => [],
            'mensajes_pendientes' => [],
        ];
    }

    private function getAsistenciaPercentage(Estudiante $estudiante): float
    {
        $totalSesiones = AsistenciaAlumno::where('id_estudiante', $estudiante->estu_id)->count();
        
        if ($totalSesiones === 0) {
            return 0;
        }

        $presentes = AsistenciaAlumno::where('id_estudiante', $estudiante->estu_id)
            ->whereIn('estado', ['P', 'T', 'J'])
            ->count();

        return round(($presentes / $totalSesiones) * 100, 1);
    }

    private function getPromedioGeneral(Estudiante $estudiante): float
    {
        // TODO: Implementar cuando el modelo Calificacion esté disponible
        return 0;
    }

    private function getTareasPendientes(Estudiante $estudiante): int
    {
        // TODO: Implementar cuando las relaciones de actividades estén completas
        return 0;
    }
}
