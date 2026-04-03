<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PagoNotificaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'pag_id'     => $this->pag_id,
            'estado'     => $this->estado,
            'comentario' => $this->comentario,
            'archivo_url'=> Storage::url($this->archivo),
            'usuario'    => $this->whenLoaded('usuario', fn () => [
                'id'       => $this->usuario->id,
                'username' => $this->usuario->username,
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
