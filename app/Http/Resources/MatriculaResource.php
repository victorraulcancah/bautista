<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatriculaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'matricula_id'  => $this->matricula_id,
            'apertura_id'   => $this->apertura_id,
            'estudiante_id' => $this->estudiante_id,
            'seccion_id'    => $this->seccion_id,
            'anio'          => $this->anio,
            'estado'        => $this->estado,
            'estudiante' => $this->whenLoaded('estudiante', fn () => [
                'estu_id'        => $this->estudiante->estu_id,
                'nombre_completo'=> trim(
                    ($this->estudiante->perfil?->primer_nombre ?? '') . ' ' .
                    ($this->estudiante->perfil?->apellido_paterno ?? '')
                ),
                'doc_numero'     => $this->estudiante->perfil?->doc_numero,
                'genero'         => $this->estudiante->perfil?->genero,
            ]),
            'seccion' => $this->whenLoaded('seccion', fn () => [
                'seccion_id' => $this->seccion->seccion_id,
                'nombre'     => $this->seccion->nombre,
            ]),
        ];
    }
}
