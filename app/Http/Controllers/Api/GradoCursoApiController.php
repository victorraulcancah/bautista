<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\Grado;
use App\Models\GradoCurso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradoCursoApiController extends Controller
{
    /**
     * Listar cursos asignados a un grado
     */
    public function index(Request $request, int $gradoId): JsonResponse
    {
        $grado = Grado::with(['cursosAsignados.nivel', 'cursosAsignados.grado'])
            ->findOrFail($gradoId);

        $cursos = $grado->cursosAsignados->map(function ($curso) {
            return [
                'grac_id' => $curso->pivot->grac_id,
                'curso_id' => $curso->curso_id,
                'nombre' => $curso->nombre,
                'descripcion' => $curso->descripcion,
                'logo' => $curso->logo,
                'estado' => $curso->estado,
            ];
        });

        return response()->json($cursos);
    }

    /**
     * Obtener cursos disponibles para asignar a un grado
     */
    public function cursosDisponibles(int $gradoId): JsonResponse
    {
        $grado = Grado::with('nivel')->findOrFail($gradoId);
        
        // Obtener cursos del nivel que NO están asignados al grado
        $cursosAsignados = GradoCurso::where('id_grado', $gradoId)
            ->where('grac_estado', 1)
            ->pluck('id_curso');

        $cursosDisponibles = Curso::where('nivel_academico_id', $grado->nivel_id)
            ->whereNotIn('curso_id', $cursosAsignados)
            ->where('estado', '1')
            ->get(['curso_id', 'nombre', 'descripcion']);

        return response()->json($cursosDisponibles);
    }

    /**
     * Asignar un curso a un grado
     */
    public function store(Request $request, int $gradoId): JsonResponse
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,curso_id',
        ]);

        // Verificar que el curso no esté ya asignado
        $existe = GradoCurso::where('id_grado', $gradoId)
            ->where('id_curso', $request->curso_id)
            ->where('grac_estado', 1)
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'El curso ya está asignado a este grado',
            ], 422);
        }

        $gradoCurso = GradoCurso::create([
            'id_grado' => $gradoId,
            'id_curso' => $request->curso_id,
            'grac_estado' => 1,
        ]);

        return response()->json([
            'message' => 'Curso asignado correctamente',
            'data' => $gradoCurso,
        ], 201);
    }

    /**
     * Desasignar un curso de un grado (soft delete)
     */
    public function destroy(int $gradoId, int $gracId): JsonResponse
    {
        $gradoCurso = GradoCurso::where('grac_id', $gracId)
            ->where('id_grado', $gradoId)
            ->firstOrFail();

        $gradoCurso->update(['grac_estado' => 0]);

        return response()->json([
            'message' => 'Curso desasignado correctamente',
        ]);
    }
}
