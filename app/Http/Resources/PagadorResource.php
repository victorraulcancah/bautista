<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagadorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_contacto' => $this->id_contacto,
            'nombres'     => $this->nombres,
            'apellidos'   => $this->apellidos,
            'numero_doc'  => $this->numero_doc,
            'telefono_1'  => $this->telefono_1,
            'pagos_count' => $this->pagos_count ?? 0,
            'estudiantes' => $this->whenLoaded('estudiantes', fn () =>
                $this->estudiantes->map(fn ($e) => [
                    'estu_id'        => $e->estu_id,
                    'nombre_completo'=> $e->nombre_completo,
                    'mensualidad'    => $e->pivot->mensualidad ?? 0,
                ])
            ),
        ];
    }
}