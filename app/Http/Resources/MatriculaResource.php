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
            'estu_id'       => $this->estu_id,
            'seccion_id'    => $this->seccion_id,
            'anio'          => $this->anio,
            'estado'        => $this->estado,
            'fecha_matricula' => $this->created_at?->format('Y-m-d'),
            'estudiante' => $this->whenLoaded('estudiante', fn () => [
                'estu_id'          => $this->estudiante->estu_id,
                'primer_nombre'    => $this->estudiante->perfil?->primer_nombre,
                'segundo_nombre'   => $this->estudiante->perfil?->segundo_nombre,
                'apellido_paterno' => $this->estudiante->perfil?->apellido_paterno,
                'apellido_materno' => $this->estudiante->perfil?->apellido_materno,
                'nombre_completo'  => trim(
                    ($this->estudiante->perfil?->primer_nombre ?? '') . ' ' .
                    ($this->estudiante->perfil?->segundo_nombre ?? '') . ' ' .
                    ($this->estudiante->perfil?->apellido_paterno ?? '') . ' ' .
                    ($this->estudiante->perfil?->apellido_materno ?? '')
                ),
                'doc_numero'       => $this->estudiante->perfil?->doc_numero,
                'genero'           => $this->estudiante->perfil?->genero,
                'user_id'          => $this->estudiante->user?->id,
                'estado_user'      => $this->estudiante->user?->estado,
                'avatar'           => $this->estudiante->perfil?->foto_perfil ? asset('storage/' . $this->estudiante->perfil->foto_perfil) : null,
                'telefono'         => $this->estudiante->perfil?->telefono,
            ]),
            'seccion' => $this->whenLoaded('seccion', fn () => [
                'seccion_id' => $this->seccion->seccion_id,
                'nombre'     => $this->seccion->nombre,
                'grado'      => $this->seccion->grado ? [
                    'grado_id'     => $this->seccion->grado->grado_id,
                    'nombre_grado' => $this->seccion->grado->nombre_grado,
                    'nivel'        => $this->seccion->grado->nivel ? [
                        'nivel_id'     => $this->seccion->grado->nivel->nivel_id,
                        'nombre_nivel' => $this->seccion->grado->nivel->nombre_nivel,
                    ] : null,
                ] : null,
            ]),
        ];
    }
}
