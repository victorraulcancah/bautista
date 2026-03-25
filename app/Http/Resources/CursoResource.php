<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CursoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'curso_id'           => $this->curso_id,
            'id_insti'           => $this->id_insti,
            'nombre'             => $this->nombre,
            'descripcion'        => $this->descripcion,
            'logo'               => $this->logo,
            'nivel_academico_id' => $this->nivel_academico_id,
            'grado_academico'    => $this->grado_academico,
            'estado'             => $this->estado,
            'nivel' => $this->whenLoaded('nivel', fn () => [
                'nivel_id'     => $this->nivel->nivel_id,
                'nombre_nivel' => $this->nivel->nombre_nivel,
            ]),
            'grado' => $this->whenLoaded('grado', fn () => [
                'grado_id'     => $this->grado->grado_id,
                'nombre_grado' => $this->grado->nombre_grado,
            ]),
        ];
    }
}
