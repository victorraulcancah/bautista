<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocenteCursoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'docen_curso_id' => $this->docen_curso_id,
            'docente_id' => $this->docente_id,
            'curso_id' => $this->curso_id,
            'seccion_id' => $this->seccion_id,
            'apertura_id' => $this->apertura_id,
            'estado' => $this->estado,
            'settings' => $this->settings,
            'banner' => $this->banner,
            'banner_url' => $this->banner ? \Storage::disk('public')->url($this->banner) : null,
            'curso' => new CursoResource($this->whenLoaded('curso')),
            'seccion' => $this->whenLoaded('seccion'),
            'apertura' => $this->whenLoaded('apertura'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
