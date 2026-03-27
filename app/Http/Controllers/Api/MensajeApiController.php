<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MensajeResource;
use App\Services\Interfaces\MensajeServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MensajeApiController extends Controller
{
    public function __construct(
        private readonly MensajeServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $bandeja = $request->get('bandeja', 'recibidos');

        $datos = $bandeja === 'enviados'
            ? $this->service->enviados(
                userId:  $request->user()->id,
                instiId: $request->user()->insti_id,
                perPage: (int) $request->get('per_page', 20),
            )
            : $this->service->bandeja(
                userId:  $request->user()->id,
                instiId: $request->user()->insti_id,
                perPage: (int) $request->get('per_page', 20),
            );

        return MensajeResource::collection($datos);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'destinatario_id' => ['nullable', 'integer'],
            'grupo_id'        => ['nullable', 'integer'],
            'asunto'          => ['required', 'string', 'max:255'],
            'cuerpo'          => ['required', 'string'],
        ]);

        $mensaje = $this->service->enviar(
            instiId:    $request->user()->insti_id,
            remitenteId: $request->user()->id,
            data:       $request->only('destinatario_id', 'grupo_id', 'asunto', 'cuerpo'),
        );

        return (new MensajeResource($mensaje))->response()->setStatusCode(201);
    }

    public function show(Request $request, int $id): MensajeResource
    {
        return new MensajeResource(
            $this->service->obtener($id, $request->user()->id)
        );
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $request->validate(['respuesta' => ['required', 'string']]);

        $resp = $this->service->responder($id, $request->user()->id, $request->input('respuesta'));

        return response()->json([
            'id'         => $resp->id,
            'respuesta'  => $resp->respuesta,
            'created_at' => $resp->created_at?->format('d/m/Y H:i'),
            'autor'      => [
                'id'     => $request->user()->id,
                'nombre' => $request->user()->perfil
                    ? trim("{$request->user()->perfil->primer_nombre} {$request->user()->perfil->apellido_paterno}")
                    : $request->user()->username,
            ],
        ], 201);
    }

    public function noLeidos(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $this->service->noLeidos($request->user()->id),
        ]);
    }
}
