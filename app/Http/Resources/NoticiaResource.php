<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoticiaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'not_id'                => $this->not_id,
            'insti_id'              => $this->insti_id,
            'not_titulo'            => $this->not_titulo,
            'not_resumen'           => $this->not_resumen,
            'not_mensaje'           => $this->not_mensaje,
            'not_contenido_html'    => $this->not_contenido_html,
            'not_cita_autoridad'    => $this->not_cita_autoridad,
            'not_cita_estudiante'   => $this->not_cita_estudiante,
            'not_multimedia_json'   => $this->not_multimedia_json,
            'not_lugar_evento'      => $this->not_lugar_evento,
            'not_fecha_evento'      => $this->not_fecha_evento,
            'not_fecha_publicacion' => $this->not_fecha_publicacion,
            'not_fecha_expiracion'  => $this->not_fecha_expiracion,
            'not_fecha'             => $this->not_fecha,
            'not_estatus'           => $this->not_estatus,
            'autor'                 => $this->autor,
            'url'                   => $this->not_imagen
                ? asset('storage/noticias/' . $this->not_imagen)
                : null,
        ];
    }
}
