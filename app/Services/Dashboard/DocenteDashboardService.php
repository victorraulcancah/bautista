<?php

namespace App\Services\Dashboard;

use App\Models\Docente;
use App\Models\DocenteCurso;
use App\Models\Matricula;
use App\Models\User;

class DocenteDashboardService
{
    public function getStats(User $user): array
    {
        $docente = Docente::where('id_usuario', $user->id)->first();
        
        if (!$docente) {
            return ['error' => 'No docente found'];
        }

        $cursosCount = DocenteCurso::where('docente_id', $docente->docente_id)->count();
        $estudiantesCount = Matricula::whereHas('apertura', function($q) use ($user) {
            $q->where('insti_id', $user->insti_id);
        })->count();

        return [
            'resumen' => [
                'cursos' => $cursosCount,
                'estudiantes' => $estudiantesCount,
                'pendientes_calificar' => 0
            ],
            'cursos' => DocenteCurso::where('docente_id', $docente->docente_id)
                ->with(['curso', 'seccion.grado'])
                ->get(),
            'notificaciones'      => [],
            'mensajes_pendientes' => [],
        ];
    }
}
