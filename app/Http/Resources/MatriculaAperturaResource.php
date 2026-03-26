<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatriculaAperturaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'apertura_id'      => $this->apertura_id,
            'insti_id'         => $this->insti_id,
            'nombre'           => $this->nombre,
            'anio'             => $this->anio,
            'fecha_inicio'     => $this->fecha_inicio?->toDateString(),
            'fecha_fin'        => $this->fecha_fin?->toDateString(),
            'estado'           => $this->estado,
            'matriculas_count' => $this->matriculas_count ?? 0,
        ];
    }
}
