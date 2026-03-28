<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocenteCurso;
use App\Models\HorarioAsistencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocenteCursoApiController extends Controller
{
    /** GET /api/docentes/{docenteId}/cursos */
    public function index(int $docenteId): JsonResponse
    {
        $cursos = DocenteCurso::with(['apertura', 'curso', 'nivel', 'grado', 'seccion'])
            ->where('docente_id', $docenteId)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($dc) => [
                'id'       => $dc->id,
                'apertura' => $dc->apertura ? ['id' => $dc->apertura->apertura_id, 'nombre' => $dc->apertura->nombre] : null,
                'curso'    => $dc->curso    ? ['id' => $dc->curso->curso_id,       'nombre' => $dc->curso->nombre]    : null,
                'nivel'    => $dc->nivel    ? ['id' => $dc->nivel->nivel_id,        'nombre' => $dc->nivel->nombre_nivel]    : null,
                'grado'    => $dc->grado    ? ['id' => $dc->grado->grado_id,        'nombre' => $dc->grado->nombre_grado]    : null,
                'seccion'  => $dc->seccion  ? ['id' => $dc->seccion->seccion_id,    'nombre' => $dc->seccion->nombre]  : null,
                'estado'   => $dc->estado,
            ]);

        return response()->json($cursos);
    }

    /** POST /api/docentes/{docenteId}/cursos */
    public function store(Request $request, int $docenteId): JsonResponse
    {
        $data = $request->validate([
            'apertura_id' => ['nullable', 'integer', 'exists:matricula_aperturas,apertura_id'],
            'curso_id'    => ['nullable', 'integer', 'exists:cursos,curso_id'],
            'nivel_id'    => ['nullable', 'integer', 'exists:niveles_educativos,nivel_id'],
            'grado_id'    => ['nullable', 'integer', 'exists:grados,grado_id'],
            'seccion_id'  => ['nullable', 'integer', 'exists:secciones,seccion_id'],
        ]);

        $data['docente_id'] = $docenteId;
        $data['estado']     = 1;

        $dc = DocenteCurso::create($data);
        $dc->load(['apertura', 'curso', 'nivel', 'grado', 'seccion']);

        return response()->json([
            'id'       => $dc->id,
            'apertura' => $dc->apertura ? ['id' => $dc->apertura->apertura_id, 'nombre' => $dc->apertura->nombre] : null,
            'curso'    => $dc->curso    ? ['id' => $dc->curso->curso_id,       'nombre' => $dc->curso->nombre]    : null,
            'nivel'    => $dc->nivel    ? ['id' => $dc->nivel->nivel_id,        'nombre' => $dc->nivel->nombre_nivel]    : null,
            'grado'    => $dc->grado    ? ['id' => $dc->grado->grado_id,        'nombre' => $dc->grado->nombre_grado]    : null,
            'seccion'  => $dc->seccion  ? ['id' => $dc->seccion->seccion_id,    'nombre' => $dc->seccion->nombre]  : null,
            'estado'   => $dc->estado,
        ], 201);
    }

    /** DELETE /api/docentes/{docenteId}/cursos/{id} */
    public function destroy(int $docenteId, int $id): JsonResponse
    {
        DocenteCurso::where('docente_id', $docenteId)->findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    /** GET /api/docentes/{docenteId}/horario */
    public function horario(Request $request, int $docenteId): JsonResponse
    {
        $instiId  = $request->user()->insti_id;
        $horarios = HorarioAsistencia::where('insti_id', $instiId)
            ->where('tipo_usuario', 'D')
            ->orderBy('turno')
            ->get(['horario_id', 'turno', 'hora_ingreso', 'hora_salida']);

        return response()->json($horarios);
    }
}
