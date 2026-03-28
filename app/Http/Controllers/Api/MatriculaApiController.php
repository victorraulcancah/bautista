<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMatriculaAperturaRequest;
use App\Http\Requests\StoreMatriculaRequest;
use App\Http\Requests\UpdateMatriculaAperturaRequest;
use App\Http\Resources\MatriculaAperturaResource;
use App\Http\Resources\MatriculaResource;
use App\Services\Interfaces\MatriculaServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MatriculaApiController extends Controller
{
    public function __construct(
        private readonly MatriculaServiceInterface $service,
    ) {}

    // ── Aperturas ────────────────────────────────────────────────────────────

    public function indexAperturas(Request $request): AnonymousResourceCollection
    {
        return MatriculaAperturaResource::collection($this->service->listarAperturas(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function showApertura(int $id): MatriculaAperturaResource
    {
        return new MatriculaAperturaResource($this->service->obtenerApertura($id));
    }

    public function storeApertura(StoreMatriculaAperturaRequest $request): JsonResponse
    {
        $apertura = $this->service->crearApertura(array_merge(
            $request->validated(),
            ['insti_id' => $request->user()->insti_id],
        ));

        return (new MatriculaAperturaResource($apertura))
            ->response()
            ->setStatusCode(201);
    }

    public function updateApertura(UpdateMatriculaAperturaRequest $request, int $id): MatriculaAperturaResource
    {
        return new MatriculaAperturaResource($this->service->actualizarApertura($id, $request->validated()));
    }

    public function destroyApertura(int $id): JsonResponse
    {
        $this->service->eliminarApertura($id);
        return response()->json(null, 204);
    }

    // ── Matrículas ───────────────────────────────────────────────────────────

    public function indexMatriculas(Request $request, int $aperturaId): AnonymousResourceCollection
    {
        return MatriculaResource::collection($this->service->listarMatriculas(
            aperturaId: $aperturaId,
            search:     $request->get('search') ?? '',
            perPage:    (int) $request->get('per_page', 20),
            nivelId:    $request->get('nivel_id') ? (int) $request->get('nivel_id') : null,
        ));
    }

    public function indexPorNivel(int $aperturaId): JsonResponse
    {
        return response()->json($this->service->contarPorNivel($aperturaId));
    }

    public function storeMatricula(StoreMatriculaRequest $request): JsonResponse
    {
        $matricula = $this->service->matricular($request->validated());

        return (new MatriculaResource($matricula))
            ->response()
            ->setStatusCode(201);
    }

    public function destroyMatricula(int $id): JsonResponse
    {
        $this->service->anularMatricula($id);
        return response()->json(null, 204);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function estudiantesDisponibles(Request $request, int $aperturaId): JsonResponse
    {
        $estudiantes = $this->service->estudiantesDisponibles(
            instiId:    $request->user()->insti_id,
            aperturaId: $aperturaId,
        );

        return response()->json($estudiantes->map(fn ($e) => [
            'estu_id'         => $e->estu_id,
            'nombre_completo' => trim(
                ($e->perfil?->primer_nombre ?? '') . ' ' .
                ($e->perfil?->apellido_paterno ?? '')
            ),
            'doc_numero'      => $e->perfil?->doc_numero,
        ]));
    }
}
