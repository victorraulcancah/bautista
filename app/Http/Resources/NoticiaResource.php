<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoticiaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'not_id'      => $this->not_id,
            'insti_id'    => $this->insti_id,
            'not_titulo'  => $this->not_titulo,
            'not_mensaje' => $this->not_mensaje,
            'not_fecha'   => $this->not_fecha,
            'not_estatus' => $this->not_estatus,
            'url'         => $this->not_imagen
                ? asset('storage/noticias/' . $this->not_imagen)
                : null,
        ];
    }
}
