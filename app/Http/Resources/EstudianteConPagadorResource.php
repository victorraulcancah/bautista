<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstudianteConPagadorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_usuario'   => $this->id_usuario,
            'nombres'      => $this->nombres,
            'apellidos'    => $this->apellidos,
            'telefono_1'   => $this->telefono_1,
            'numero_doc'   => $this->numero_doc,
            'mensualidad'  => $this->mensualidad,
            'estu_id'      => $this->estu_id,
            'id_contacto'  => $this->id_contacto,
            'pagos_count'  => $this->pagos_count ?? 0,
        ];
    }
}
