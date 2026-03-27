<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActividadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'actividad_id'       => $this->actividad_id,
            'id_curso'           => $this->id_curso,
            'id_clase_curso'     => $this->id_clase_curso,
            'id_tipo_activada'   => $this->id_tipo_activada,
            'nombre_activid'     => $this->nombre_activid,
            'descripcion_corta'  => $this->descripcion_corta,
            'descripcion_larga'  => $this->descripcion_larga,
            'fecha_inicio'       => $this->fecha_inicio?->toDateTimeString(),
            'fecha_cierre'       => $this->fecha_cierre?->toDateTimeString(),
            'nota_visible'       => $this->nota_visible,
            'nota_actvidad'      => $this->nota_actvidad,
            'respuesta_visible'  => $this->respuesta_visible,
            'ocultar_actividad'  => $this->ocultar_actividad,
            'estado'             => $this->estado,
            'es_calificado'      => $this->es_calificado,
            'tipo'               => $this->whenLoaded('tipo', fn() => [
                'tipo_id' => $this->tipo->tipo_id,
                'nombre'  => $this->tipo->nombre,
            ]),
            'cuestionario'       => $this->whenLoaded('cuestionario', function () {
                $cuestionario = $this->cuestionario;
                if (!$cuestionario) return null;
                return [
                    'cuestionario_id'   => $cuestionario->cuestionario_id,
                    'duracion'          => $cuestionario->duracion,
                    'nota_visible'      => $cuestionario->nota_visible,
                    'mostrar_respusta'  => $cuestionario->mostrar_respusta,
                    'estado'            => $cuestionario->estado,
                    'preguntas'         => $cuestionario->whenLoaded('preguntas') ?? $cuestionario->preguntas->map(fn($p) => [
                        'pregunta_id'   => $p->pregunta_id,
                        'cabecera'      => $p->cabecera,
                        'cuerpo'        => $p->cuerpo,
                        'tipo_respuesta'=> $p->tipo_respuesta,
                        'valor_nota'    => $p->valor_nota,
                        'alternativas'  => $p->alternativas->map(fn($a) => [
                            'alternativa_id' => $a->alternativa_id,
                            'contenido'      => $a->contenido,
                            'es_correcta'    => $a->estado_res === '1',
                        ]),
                    ]),
                ];
            }),
        ];
    }
}
