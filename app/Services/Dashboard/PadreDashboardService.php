<?php

namespace App\Services\Dashboard;

use App\Models\PadreApoderado;
use App\Models\User;

class PadreDashboardService
{
    public function getStats(User $user): array
    {
        $padre = PadreApoderado::where('user_id', $user->id)->first();

        return [
            'hijos' => $padre ? $padre->estudiantes()->with('perfil')->get() : [],
            'notificaciones'      => [],
            'mensajes_pendientes' => [],
        ];
    }
}
