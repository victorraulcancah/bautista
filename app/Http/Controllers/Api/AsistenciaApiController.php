<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MarcarAsistenciaBatchRequest;
use App\Http\Requests\MarcarAsistenciaRequest;
use App\Services\Interfaces\AsistenciaServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AsistenciaApiController extends Controller
{
    public function __construct(
        private readonly AsistenciaServiceInterface $service,
    ) {}

    /**
     * Calendario mensual de una persona.
     * GET /api/asistencia/persona?tipo=E&id=5&anio=2026&mes=3
     */
    public function calendario(Request $request): JsonResponse
    {
        $request->validate([
            'tipo' => ['required', 'in:E,D'],
            'id'   => ['required', 'integer'],
            'anio' => ['required', 'integer'],
            'mes'  => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $instiId = $request->user()->estudiante?->insti_id
            ?? $request->user()->docente?->id_insti
            ?? $request->user()->perfil?->insti_id;

        $calendario = $this->service->calendarioPersona(
            $instiId,
            (int) $request->id,
            $request->tipo,
            (int) $request->anio,
            (int) $request->mes
        );

        return response()->json($calendario);
    }

    /**
     * Reporte mensual para admin (todos los alumnos o docentes).
     * GET /api/asistencia/reporte?tipo=E&anio=2026&mes=3
     */
    public function reporte(Request $request): JsonResponse
    {
        $request->validate([
            'tipo' => ['required', 'in:E,D'],
            'anio' => ['required', 'integer'],
            'mes'  => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $instiId = $request->user()->docente?->id_insti
            ?? $request->user()->estudiante?->insti_id;

        $reporte = $this->service->reporteMes(
            $instiId,
            $request->tipo,
            (int) $request->anio,
            (int) $request->mes
        );

        return response()->json($reporte);
    }

    /**
     * Marcar asistencia individual.
     * POST /api/asistencia
     */
    public function marcar(MarcarAsistenciaRequest $request): JsonResponse
    {
        $instiId = $request->user()->docente?->id_insti
            ?? $request->user()->estudiante?->insti_id;

        $resultado = $this->service->marcar(
            array_merge($request->validated(), ['insti_id' => $instiId])
        );

        return response()->json($resultado, 201);
    }

    /**
     * Marcar asistencia en lote (docente marca su sección).
     * POST /api/asistencia/batch
     */
    public function marcarBatch(MarcarAsistenciaBatchRequest $request): JsonResponse
    {
        $instiId = $request->user()->docente?->id_insti
            ?? $request->user()->estudiante?->insti_id;

        $this->service->marcarBatch($instiId, $request->input('registros'));

        return response()->json(['ok' => true]);
    }

    /**
     * Eliminar registro.
     * DELETE /api/asistencia/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);
        return response()->json(null, 204);
    }
}
