<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'clase_id'    => $this->clase_id,
            'unidad_id'   => $this->unidad_id,
            'titulo'      => $this->titulo,
            'descripcion' => $this->descripcion,
            'orden'       => $this->orden,
            'estado'      => $this->estado,
            'archivos'    => $this->whenLoaded('archivos', fn () =>
                $this->archivos->map(fn ($a) => [
                    'archivo_id' => $a->archivo_id,
                    'nombre'     => $a->nombre,
                    'titulo'     => $a->titulo,
                    'descripcion' => $a->descripcion,
                    'path'       => $a->path,
                    'tipo'       => $a->tipo,
                    'tamanio'    => $a->tamanio,
                    'visible'    => $a->visible,
                    'url'        => asset('storage/' . $a->path),
                ])
            ),
            'actividades' => $this->whenLoaded('actividades', fn () =>
                $this->actividades->map(fn ($act) => [
                    'actividad_id'      => $act->actividad_id,
                    'nombre_actividad'  => $act->nombre_actividad,
                    'descripcion_corta' => $act->descripcion_corta,
                    'fecha_cierre'      => $act->fecha_cierre,
                    'id_tipo_actividad' => $act->id_tipo_actividad,
                    'tipo_actividad'    => [
                        'nombre' => $act->tipoActividad?->nombre
                    ],
                ])
            ),
        ];
    }
}
