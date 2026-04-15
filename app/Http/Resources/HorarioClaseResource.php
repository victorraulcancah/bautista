<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HorarioClaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'horario_clase_id' => $this->horario_clase_id,
            'seccion_id' => $this->seccion_id,
            'curso_id' => $this->curso_id,
            'docente_id' => $this->docente_id,
            'dia_semana' => $this->dia_semana,
            'hora_inicio' => $this->hora_inicio,
            'hora_fin' => $this->hora_fin,
            'aula' => $this->aula,
            'anio_escolar' => $this->anio_escolar,
            'periodo' => $this->periodo,
            'activo' => $this->activo,
            
            // Relaciones
            'curso' => $this->whenLoaded('curso', function () {
                return [
                    'curso_id' => $this->curso->curso_id,
                    'nombre' => $this->curso->nombre,
                    'codigo' => $this->curso->codigo,
                ];
            }),
            
            'docente' => $this->whenLoaded('docente', function () {
                return [
                    'docente_id' => $this->docente->docente_id,
                    'nombres' => $this->docente->nombres,
                    'apellidos' => $this->docente->apellidos,
                    'nombre_completo' => $this->docente->nombres . ' ' . $this->docente->apellidos,
                ];
            }),
            
            'seccion' => $this->whenLoaded('seccion', function () {
                return [
                    'seccion_id' => $this->seccion->seccion_id,
                    'nombre' => $this->seccion->nombre,
                ];
            }),
            
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
