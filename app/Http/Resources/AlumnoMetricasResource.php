<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlumnoMetricasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'estu_id' => $this->resource['estu_id'],
            'nombre' => $this->resource['nombre'],
            'foto' => $this->resource['foto'],
            'promedio' => $this->resource['promedio'],
            'asistencia' => $this->resource['asistencia'],
            'progreso' => $this->resource['progreso'],
            'actividadesCompletadas' => $this->resource['actividadesCompletadas'],
            'actividadesTotales' => $this->resource['actividadesTotales'],
        ];
    }
}
