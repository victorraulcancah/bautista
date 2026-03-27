<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MensajeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'asunto'         => $this->asunto,
            'cuerpo'         => $this->cuerpo,
            'leido'          => $this->leido,
            'created_at'     => $this->created_at?->format('d/m/Y H:i'),
            'remitente'      => $this->whenLoaded('remitente', fn () => [
                'id'     => $this->remitente->id,
                'nombre' => $this->remitente->perfil
                    ? trim("{$this->remitente->perfil->primer_nombre} {$this->remitente->perfil->apellido_paterno}")
                    : $this->remitente->username,
            ]),
            'destinatario'   => $this->whenLoaded('destinatario', fn () => $this->destinatario ? [
                'id'     => $this->destinatario->id,
                'nombre' => $this->destinatario->perfil
                    ? trim("{$this->destinatario->perfil->primer_nombre} {$this->destinatario->perfil->apellido_paterno}")
                    : $this->destinatario->username,
            ] : null),
            'grupo'          => $this->whenLoaded('grupo', fn () => $this->grupo ? [
                'id'     => $this->grupo->id,
                'nombre' => $this->grupo->nombre,
            ] : null),
            'respuestas'     => $this->whenLoaded('respuestas', fn () =>
                $this->respuestas->map(fn ($r) => [
                    'id'         => $r->id,
                    'respuesta'  => $r->respuesta,
                    'created_at' => $r->created_at?->format('d/m/Y H:i'),
                    'autor'      => [
                        'id'     => $r->autor->id,
                        'nombre' => $r->autor->perfil
                            ? trim("{$r->autor->perfil->primer_nombre} {$r->autor->perfil->apellido_paterno}")
                            : $r->autor->username,
                    ],
                ])
            ),
        ];
    }
}
