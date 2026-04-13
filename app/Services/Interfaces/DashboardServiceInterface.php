<?php

namespace App\Services\Interfaces;

use App\Models\User;

interface DashboardServiceInterface
{
    public function getStatsForUser(User $user): array;
}
