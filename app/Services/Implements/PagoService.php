<?php

namespace App\Services\Implements;

use App\Models\Pago;
use App\Repositories\Interfaces\PagoRepositoryInterface;
use App\Services\ActividadUsuarioService;
use App\Services\Interfaces\PagoServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PagoService implements PagoServiceInterface
{
    public function __construct(
        private readonly PagoRepositoryInterface $repo,
        private readonly ActividadUsuarioService $auditoria,
    ) {}

    public function listarEstudiantesConPagador(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator
    {
        return $this->repo->paginateEstudiantesConPagador($instiId, $search, $perPage);
    }

    public function listarPagadores(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator
    {
        return $this->repo->paginatePagadores($instiId, $search, $perPage);
    }

    public function pagosPorContacto(int $contactoId): Collection
    {
        return $this->repo->pagosPorContacto($contactoId);
    }

    public function crearPago(array $data): Pago
    {
        $data['total'] = ($data['pag_monto'] ?? 0)
                       + ($data['pag_otro1'] ?? 0)
                       + ($data['pag_otro2'] ?? 0);

        $data['estatus'] = ($data['pag_monto'] > 0) ? 1 : 0;

        $pago = $this->repo->create($data);
        $this->auditoria->registrar('crear', 'Pago', $pago->pag_id,
            "Pago registrado: S/ {$pago->total} — {$pago->pag_mes} {$pago->pag_anual}");
        return $pago;
    }

    public function actualizarPago(int $id, array $data): Pago
    {
        $pago = $this->repo->findById($id);

        $data['total'] = ($data['pag_monto'] ?? $pago->pag_monto)
                       + ($data['pag_otro1'] ?? $pago->pag_otro1)
                       + ($data['pag_otro2'] ?? $pago->pag_otro2);

        $data['estatus'] = (($data['pag_monto'] ?? $pago->pag_monto) > 0) ? 1 : 0;

        $updated = $this->repo->update($pago, $data);
        $this->auditoria->registrar('actualizar', 'Pago', $id,
            "Pago actualizado: S/ {$updated->total} — {$updated->pag_mes} {$updated->pag_anual}");
        return $updated;
    }

    public function eliminarPago(int $id): void
    {
        $pago = $this->repo->findById($id);
        $this->auditoria->registrar('eliminar', 'Pago', $id,
            "Pago eliminado: S/ {$pago->total} — {$pago->pag_mes} {$pago->pag_anual}");
        $this->repo->delete($pago);
    }
}