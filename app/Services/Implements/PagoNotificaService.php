<?php

namespace App\Services\Implements;

use App\Models\PagoNotifica;
use App\Repositories\Interfaces\PagoNotificaRepositoryInterface;
use App\Repositories\Interfaces\PagoRepositoryInterface;
use App\Services\Interfaces\PagoNotificaServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PagoNotificaService implements PagoNotificaServiceInterface
{
    public function __construct(
        private readonly PagoNotificaRepositoryInterface $repo,
        private readonly PagoRepositoryInterface $pagoRepo,
    ) {}

    public function listarPorPago(int $pagId): Collection
    {
        return $this->repo->porPago($pagId);
    }

    public function subirVoucher(int $pagId, int $userId, UploadedFile $archivo): PagoNotifica
    {
        $ruta = $archivo->store("vouchers/{$pagId}", 'public');

        return $this->repo->create([
            'pag_id'  => $pagId,
            'user_id' => $userId,
            'archivo' => $ruta,
            'estado'  => 'pendiente',
        ]);
    }

    public function validar(int $notificaId, string $estado, ?string $comentario): PagoNotifica
    {
        $notifica = $this->repo->findById($notificaId);
        $updated = $this->repo->actualizarEstado($notifica, $estado, $comentario);

        // Si el estado es 'validado', marcamos el pago como pagado (estatus = 1 en este sistema)
        if ($estado === 'validado') {
            $pago = $this->pagoRepo->findById($notifica->pag_id);
            $this->pagoRepo->update($pago, ['estatus' => 1, 'pag_fecha' => now()]);
        }

        return $updated;
    }
}
