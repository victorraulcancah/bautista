<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GaleriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'gal_id'       => $this->gal_id,
            'insti_id'     => $this->insti_id,
            'gal_nombre'   => $this->gal_nombre,
            'gal_posicion' => $this->gal_posicion,
            'gal_estatus'  => $this->gal_estatus,
            'url'          => $this->gal_nombre
                ? asset('storage/galeria/' . $this->gal_nombre)
                : null,
        ];
    }
}
