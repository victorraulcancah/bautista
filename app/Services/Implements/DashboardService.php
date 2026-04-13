<?php

namespace App\Services\Implements;

use App\Models\User;
use App\Services\Dashboard\AdminDashboardService;
use App\Services\Dashboard\DocenteDashboardService;
use App\Services\Dashboard\EstudianteDashboardService;
use App\Services\Dashboard\PadreDashboardService;
use App\Services\Interfaces\DashboardServiceInterface;

class DashboardService implements DashboardServiceInterface
{
    public function __construct(
        private AdminDashboardService $adminService,
        private DocenteDashboardService $docenteService,
        private EstudianteDashboardService $estudianteService,
        private PadreDashboardService $padreService
    ) {}

    public function getStatsForUser(User $user): array
    {
        if ($user->hasRole('docente')) {
            return $this->docenteService->getStats($user);
        }

        if ($user->hasRole('estudiante')) {
            return $this->estudianteService->getStats($user);
        }

        if ($user->hasRole(['padre_familia', 'madre_familia', 'apoderado'])) {
            return $this->padreService->getStats($user);
        }

        // Default: Admin Stats
        return $this->adminService->getStats($user);
    }
}
