<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGaleriaRequest;
use App\Http\Requests\UpdateGaleriaRequest;
use App\Http\Resources\GaleriaResource;
use App\Services\Interfaces\GaleriaServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GaleriaApiController extends Controller
{
    public function __construct(
        private readonly GaleriaServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return GaleriaResource::collection(
            $this->service->listar(
                instiId: $request->user()->insti_id,
                perPage: (int) $request->get('per_page', 20),
            )
        );
    }

    public function store(StoreGaleriaRequest $request): JsonResponse
    {
        $foto = $this->service->subir($request->user()->insti_id, $request->validated());

        return (new GaleriaResource($foto))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateGaleriaRequest $request, int $id): GaleriaResource
    {
        return new GaleriaResource(
            $this->service->actualizar($id, $request->validated())
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);
        return response()->json(null, 204);
    }
}
