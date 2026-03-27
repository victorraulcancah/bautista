<?php

namespace App\Services\Implements;

use App\Models\Mensaje;
use App\Models\MensajeRespuesta;
use App\Models\MensajeriaGrupo;
use App\Services\Interfaces\MensajeServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class MensajeService implements MensajeServiceInterface
{
    public function bandeja(int $userId, int $instiId, int $perPage): LengthAwarePaginator
    {
        // Mensajes individuales recibidos + mensajes de grupos donde el usuario es miembro
        $gruposIds = MensajeriaGrupo::whereHas('miembros', fn ($q) => $q->where('user_id', $userId))
            ->pluck('id');

        return Mensaje::where('insti_id', $instiId)
            ->where(function ($q) use ($userId, $gruposIds) {
                $q->where('destinatario_id', $userId)
                  ->orWhereIn('grupo_id', $gruposIds);
            })
            ->with(['remitente.perfil', 'grupo'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function enviados(int $userId, int $instiId, int $perPage): LengthAwarePaginator
    {
        return Mensaje::where('insti_id', $instiId)
            ->where('remitente_id', $userId)
            ->with(['destinatario.perfil', 'grupo'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function obtener(int $id, int $userId): Mensaje
    {
        $mensaje = Mensaje::with([
            'remitente.perfil',
            'destinatario.perfil',
            'grupo',
            'respuestas.autor.perfil',
        ])->findOrFail($id);

        // Marcar como leído si el usuario es el destinatario
        if (!$mensaje->leido && $mensaje->destinatario_id === $userId) {
            $mensaje->update(['leido' => true]);
        }

        return $mensaje;
    }

    public function enviar(int $instiId, int $remitenteId, array $data): Mensaje
    {
        $mensaje = Mensaje::create([
            'insti_id'         => $instiId,
            'remitente_id'     => $remitenteId,
            'destinatario_id'  => $data['destinatario_id'] ?? null,
            'grupo_id'         => $data['grupo_id'] ?? null,
            'asunto'           => $data['asunto'],
            'cuerpo'           => $data['cuerpo'],
            'leido'            => false,
        ]);

        // Crear respuesta inicial con el cuerpo del mensaje
        MensajeRespuesta::create([
            'mensaje_id' => $mensaje->id,
            'user_id'    => $remitenteId,
            'respuesta'  => $data['cuerpo'],
        ]);

        return $mensaje->load(['remitente.perfil', 'destinatario.perfil', 'grupo']);
    }

    public function responder(int $mensajeId, int $userId, string $respuesta): MensajeRespuesta
    {
        return MensajeRespuesta::create([
            'mensaje_id' => $mensajeId,
            'user_id'    => $userId,
            'respuesta'  => $respuesta,
        ]);
    }

    public function noLeidos(int $userId): int
    {
        return Mensaje::where('destinatario_id', $userId)
            ->where('leido', false)
            ->count();
    }
}
