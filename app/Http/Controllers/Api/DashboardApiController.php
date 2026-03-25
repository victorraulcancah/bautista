<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\InstitucionEducativa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $instiId = $request->user()->insti_id;

        return response()->json([
            'instituciones' => InstitucionEducativa::count(),
            'estudiantes'   => Estudiante::where('insti_id', $instiId)->count(),
            'docentes'      => Docente::where('id_insti', $instiId)->count(),
            'cursos'        => Curso::where('id_insti', $instiId)->where('estado', '1')->count(),
        ]);
    }
}
