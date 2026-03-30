<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeccionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'seccion_id'  => $this->seccion_id,
            'id_grado'    => $this->id_grado,
            'nombre'      => $this->nombre,
            'abreviatura' => $this->abreviatura,
            'cnt_alumnos' => $this->cnt_alumnos,
            'horario'     => $this->horario,
            'grado'       => $this->whenLoaded('grado', fn () => [
                'grado_id'     => $this->grado->grado_id,
                'nombre_grado' => $this->grado->nombre_grado,
                'nivel'        => $this->grado->relationLoaded('nivel') ? [
                    'nivel_id'     => $this->grado->nivel?->nivel_id,
                    'nombre_nivel' => $this->grado->nivel?->nombre_nivel,
                ] : null,
            ]),
        ];
    }
}
