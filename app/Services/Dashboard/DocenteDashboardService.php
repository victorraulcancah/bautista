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

        $pendientesCalificar = NotaActividad::whereHas('actividad', function ($q) use ($docente) {
            $q->whereHas('clase.unidad.curso', function ($q2) use ($docente) {
                $q2->whereHas('docenteCursos', fn($q3) => $q3->where('docente_id', $docente->docente_id));
            });
        })->whereNull('nota')->whereNotNull('archivo_entrega')->count();

        return [
            'resumen' => [
                'cursos'               => $cursosCount,
                'estudiantes'          => Matricula::whereHas('apertura', fn($q) => $q->where('insti_id', $user->insti_id))->count(),
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
