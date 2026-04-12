<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FotocheckDataResource extends JsonResource
{
    protected string $tipo;
    protected string $idDisplay;

    public function __construct($resource, string $tipo, string $idDisplay)
    {
        parent::__construct($resource);
        $this->tipo = $tipo;
        $this->idDisplay = $idDisplay;
    }

    /**
     * Transform the resource into an array for the blade view.
     */
    public function toArray(Request $request): array
    {
        $user = $this->resource;
        
        return [
            'user'      => $user,
            'tipo'      => $this->tipo,
            'idDisplay' => $this->idDisplay,
            'nombre'    => $user->nombre_completo,
            'apellidos' => $user->perfil->apellido_paterno . ' ' . $user->perfil->apellido_materno,
            'nombres'   => $user->perfil->primer_nombre . ' ' . $user->perfil->segundo_nombre,
            'dni'       => $user->perfil->doc_numero,
            'foto'      => $user->perfil->foto_perfil,
        ];
    }
}
