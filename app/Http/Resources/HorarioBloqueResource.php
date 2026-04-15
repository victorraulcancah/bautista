<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HorarioBloqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'horario_bloque_id' => $this->horario_bloque_id,
            'insti_id' => $this->insti_id,
            'nombre' => $this->nombre,
            'hora_inicio' => $this->hora_inicio,
            'hora_fin' => $this->hora_fin,
            'orden' => $this->orden,
            'es_recreo' => $this->es_recreo,
            'duracion_minutos' => $this->duracion_minutos,
            
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
