<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\HorarioNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHorarioBloqueRequest;
use App\Http\Requests\UpdateHorarioBloqueRequest;
use App\Http\Resources\HorarioBloqueResource;
use App\Models\HorarioBloque;
use App\Services\Interfaces\HorarioServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorarioBloqueApiController extends Controller
{
    public function __construct(
        private HorarioServiceInterface $horarioService
    ) {}

    /**
     * GET /api/horario-bloques
     * Listar bloques horarios de la institución
     */
    public function index(Request $request): JsonResponse
    {
        $instiId = $request->user()->insti_id;
        $bloques = $this->horarioService->obtenerBloquesHorarios($instiId);

        return response()->json(HorarioBloqueResource::collection($bloques));
    }

    /**
     * POST /api/horario-bloques
     * Crear nuevo bloque horario
     */
    public function store(StoreHorarioBloqueRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['insti_id'] = $request->user()->insti_id;

        $bloque = HorarioBloque::create($validated);

        return response()->json([
            'message' => 'Bloque horario creado exitosamente',
            'bloque' => new HorarioBloqueResource($bloque)
        ], 201);
    }

    /**
     * PUT /api/horario-bloques/{id}
     * Actualizar bloque horario
     */
    public function update(UpdateHorarioBloqueRequest $request, int $id): JsonResponse
    {
        $bloque = HorarioBloque::find($id);

        if (!$bloque) {
            throw new HorarioNotFoundException("Bloque horario con ID {$id} no encontrado");
        }

        // Verificar que pertenece a la institución del usuario
        if ($bloque->insti_id !== $request->user()->insti_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validated();
        $bloque->update($validated);

        return response()->json([
            'message' => 'Bloque horario actualizado exitosamente',
            'bloque' => new HorarioBloqueResource($bloque)
        ]);
    }

    /**
     * DELETE /api/horario-bloques/{id}
     * Eliminar bloque horario
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $bloque = HorarioBloque::find($id);

        if (!$bloque) {
            throw new HorarioNotFoundException("Bloque horario con ID {$id} no encontrado");
        }

        // Verificar que pertenece a la institución del usuario
        if ($bloque->insti_id !== $request->user()->insti_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $bloque->delete();

        return response()->json([
            'message' => 'Bloque horario eliminado exitosamente'
        ]);
    }
}
