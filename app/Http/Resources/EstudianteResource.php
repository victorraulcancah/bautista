<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstudianteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'estu_id'             => $this->estu_id,
            'insti_id'            => $this->insti_id,
            'estado'              => $this->estado,
            'colegio'             => $this->colegio,
            'neurodivergencia'    => $this->neurodivergencia,
            'terapia_ocupacional' => $this->terapia_ocupacional,
            'edad'                => $this->edad,
            'talla'               => $this->talla,
            'peso'                => $this->peso,
            'seguro'              => $this->seguro,
            'privado'             => $this->privado,
            'mensualidad'         => $this->mensualidad,
            'fecha_ingreso'       => $this->fecha_ingreso?->format('Y-m-d'),
            'fecha_promovido'     => $this->fecha_promovido?->format('Y-m-d'),
            'perfil' => $this->whenLoaded('perfil', fn () => [
                'primer_nombre'    => $this->perfil->primer_nombre,
                'segundo_nombre'   => $this->perfil->segundo_nombre,
                'apellido_paterno' => $this->perfil->apellido_paterno,
                'apellido_materno' => $this->perfil->apellido_materno,
                'avatar'           => $this->perfil->foto_perfil ? asset('storage/' . $this->perfil->foto_perfil) : null,
                'genero'           => $this->perfil->genero,
                'doc_numero'       => $this->perfil->doc_numero,
                'fecha_nacimiento' => $this->perfil->fecha_nacimiento,
                'telefono'         => $this->perfil->telefono,
                'direccion'        => $this->perfil->direccion,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id'       => $this->user->id,
                'username' => $this->user->username,
                'email'    => $this->user->email,
            ]),
        ];
    }
}
