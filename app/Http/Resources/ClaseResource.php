<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'clase_id'    => $this->clase_id,
            'unidad_id'   => $this->unidad_id,
            'titulo'      => $this->titulo,
            'descripcion' => $this->descripcion,
            'orden'       => $this->orden,
            'estado'      => $this->estado,
            'archivos'    => $this->whenLoaded('archivos', fn () =>
                $this->archivos->map(fn ($a) => [
                    'archivo_id' => $a->archivo_id,
                    'nombre'     => $a->nombre,
                    'path'       => $a->path,
                    'tipo'       => $a->tipo,
                    'tamanio'    => $a->tamanio,
                    'url'        => asset('storage/' . $a->path),
                ])
            ),
        ];
    }
}
