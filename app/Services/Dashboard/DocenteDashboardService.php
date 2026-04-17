<?php

namespace App\Services\Dashboard;

use App\Models\Docente;
use App\Models\DocenteCurso;
use App\Models\Matricula;
use App\Models\NotaActividad;
use App\Models\User;
use App\Services\Notifications\NotificationService;

class DocenteDashboardService
{
    public function __construct(private NotificationService $notifService) {}

    public function getStats(User $user): array
    {
        $docente = Docente::where('id_usuario', $user->id)->first();
        if (!$docente) return ['error' => 'No docente found'];

        $cursosCount = DocenteCurso::where('docente_id', $docente->docente_id)->count();

        // Alumnos únicos en las secciones del docente (no todos los de la institución)
        $seccionIds = DocenteCurso::where('docente_id', $docente->docente_id)
            ->whereNotNull('seccion_id')
            ->pluck('seccion_id')
            ->unique();

        $estudiantesCount = Matricula::whereIn('seccion_id', $seccionIds)
            ->where('estado', '1')
            ->distinct('estu_id')
            ->count('estu_id');

        $pendientesCalificar = NotaActividad::whereHas('actividad', function ($q) use ($docente) {
            $q->whereHas('clase.unidad.curso', function ($q2) use ($docente) {
                $q2->whereHas('docenteCursos', fn($q3) => $q3->where('docente_id', $docente->docente_id));
            });
        })->whereNull('nota')->whereNotNull('archivo_entrega')->count();

        return [
            'resumen' => [
                'cursos'               => $cursosCount,
                'estudiantes'          => $estudiantesCount,
                'pendientes_calificar' => $pendientesCalificar,
            ],
            'cursos' => DocenteCurso::where('docente_id', $docente->docente_id)
                ->with(['curso', 'seccion.grado'])
                ->get(),
            'notificaciones'      => $this->notifService->forDocente($user),
            'mensajes_pendientes' => [],
        ];
    }
}
