<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HorarioAsistenciaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'horario_id' => $this->horario_id,
            'insti_id' => $this->insti_id,
            'nivel_id' => $this->nivel_id,
            'tipo_usuario' => $this->tipo_usuario,
            'tipo_usuario_texto' => $this->tipo_usuario === 'E' ? 'Estudiante' : 'Docente',
            'turno' => $this->turno,
            'turno_texto' => $this->turno === 'M' ? 'Mañana' : 'Tarde',
            'hora_ingreso' => $this->hora_ingreso,
            'hora_salida' => $this->hora_salida,
            
            // Relaciones
            'nivel' => $this->whenLoaded('nivel', function () {
                return [
                    'nivel_id' => $this->nivel->nivel_id,
                    'nombre_nivel' => $this->nivel->nombre_nivel,
                ];
            }),
            
            'institucion' => $this->whenLoaded('institucion', function () {
                return [
                    'insti_id' => $this->institucion->insti_id,
                    'nombre' => $this->institucion->nombre,
                ];
            }),
            
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
