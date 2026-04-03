<?php

namespace App\Repositories\Implements;

use App\Models\PagoNotifica;
use App\Repositories\Interfaces\PagoNotificaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PagoNotificaRepository implements PagoNotificaRepositoryInterface
{
    public function porPago(int $pagId): Collection
    {
        return PagoNotifica::with('usuario:id,username')
            ->where('pag_id', $pagId)
            ->latest()
            ->get();
    }

    public function findById(int $id): PagoNotifica
    {
        return PagoNotifica::with('usuario:id,username')->findOrFail($id);
    }

    public function create(array $data): PagoNotifica
    {
        return PagoNotifica::create($data);
    }

    public function actualizarEstado(PagoNotifica $notifica, string $estado, ?string $comentario): PagoNotifica
    {
        $notifica->update(['estado' => $estado, 'comentario' => $comentario]);
        return $notifica->fresh('usuario');
    }
}
