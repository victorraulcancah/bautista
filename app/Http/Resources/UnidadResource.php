<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnidadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'unidad_id'   => $this->unidad_id,
            'curso_id'    => $this->curso_id,
            'titulo'      => $this->titulo,
            'descripcion' => $this->descripcion,
            'orden'       => $this->orden,
            'estado'      => $this->estado,
            'clases'      => $this->whenLoaded('clases', fn () =>
                ClaseResource::collection($this->clases)
            ),
        ];
    }
}
