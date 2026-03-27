<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoticiaRequest;
use App\Http\Requests\UpdateNoticiaRequest;
use App\Http\Resources\NoticiaResource;
use App\Services\Interfaces\NoticiaServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NoticiaApiController extends Controller
{
    public function __construct(
        private readonly NoticiaServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return NoticiaResource::collection(
            $this->service->listar(
                instiId: $request->user()->insti_id,
                search:  $request->get('search') ?? '',
                perPage: (int) $request->get('per_page', 15),
            )
        );
    }

    public function store(StoreNoticiaRequest $request): JsonResponse
    {
        $noticia = $this->service->crear($request->user()->insti_id, $request->validated());

        return (new NoticiaResource($noticia))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateNoticiaRequest $request, int $id): NoticiaResource
    {
        return new NoticiaResource(
            $this->service->actualizar($id, $request->validated())
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);
        return response()->json(null, 204);
    }
}
