<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoticiaComentarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'contenido'  => $this->contenido,
            'created_at' => $this->created_at->toISOString(),
            'user'       => [
                'id'              => $this->user->id,
                'nombre_completo' => $this->user->nombre_completo,
                'avatar'          => $this->user->avatar,
            ],
            'replies'    => NoticiaComentarioResource::collection($this->replies),
        ];
    }
}
