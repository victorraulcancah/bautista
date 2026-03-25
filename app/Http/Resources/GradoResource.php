<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'grado_id'     => $this->grado_id,
            'nivel_id'     => $this->nivel_id,
            'nombre_grado' => $this->nombre_grado,
            'abreviatura'  => $this->abreviatura,
            'nivel'        => $this->whenLoaded('nivel', fn () => [
                'nivel_id'     => $this->nivel->nivel_id,
                'nombre_nivel' => $this->nivel->nombre_nivel,
            ]),
        ];
    }
}
