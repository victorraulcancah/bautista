<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Interfaces\DashboardServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function __construct(
        private DashboardServiceInterface $dashboardService
    ) {}

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = $this->dashboardService->getStatsForUser($user);

        return response()->json($stats);
    }
}
