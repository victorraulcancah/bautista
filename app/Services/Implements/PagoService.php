<?php

namespace App\Services\Implements;

use App\Models\Pago;
use App\Repositories\Interfaces\PagoRepositoryInterface;
use App\Services\Interfaces\PagoServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PagoService implements PagoServiceInterface
{
    public function __construct(
        private readonly PagoRepositoryInterface $repo,
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

        return $this->repo->create($data);
    }

    public function actualizarPago(int $id, array $data): Pago
    {
        $pago = $this->repo->findById($id);

        $data['total'] = ($data['pag_monto'] ?? $pago->pag_monto)
                       + ($data['pag_otro1'] ?? $pago->pag_otro1)
                       + ($data['pag_otro2'] ?? $pago->pag_otro2);

        $data['estatus'] = (($data['pag_monto'] ?? $pago->pag_monto) > 0) ? 1 : 0;

        return $this->repo->update($pago, $data);
    }

    public function eliminarPago(int $id): void
    {
        $pago = $this->repo->findById($id);
        $this->repo->delete($pago);
    }
}