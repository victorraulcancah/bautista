<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NivelEducativoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'nivel_id'     => $this->nivel_id,
            'nombre_nivel' => $this->nombre_nivel,
            'nivel_estatus'=> $this->nivel_estatus,
            'insti_id'     => $this->insti_id,
        ];
    }
}
