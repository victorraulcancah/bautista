<?php

namespace App\Services\Implements;

use App\Models\MensajeriaGrupo;
use App\Services\Interfaces\MensajeriaGrupoServiceInterface;
use Illuminate\Support\Collection;

class MensajeriaGrupoService implements MensajeriaGrupoServiceInterface
{
    public function listar(int $userId, int $instiId): Collection
    {
        return MensajeriaGrupo::where('insti_id', $instiId)
            ->where(function ($q) use ($userId) {
                $q->where('docente_id', $userId)
                  ->orWhereHas('miembros', fn ($q2) => $q2->where('user_id', $userId));
            })
            ->withCount('miembros')
            ->orderBy('nombre')
            ->get();
    }

    public function crear(int $instiId, int $docenteId, array $data): MensajeriaGrupo
    {
        $grupo = MensajeriaGrupo::create([
            'insti_id'    => $instiId,
            'nombre'      => $data['nombre'],
            'foto'        => $data['foto'] ?? null,
            'docente_id'  => $docenteId,
        ]);

        if (!empty($data['user_ids'])) {
            $grupo->miembros()->sync($data['user_ids']);
        }

        return $grupo->loadCount('miembros');
    }
}
