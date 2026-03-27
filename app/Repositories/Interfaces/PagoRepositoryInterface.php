<?php

namespace App\Repositories\Interfaces;

use App\Models\Pago;
use App\Models\PadreApoderado;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PagoRepositoryInterface
{
    public function paginateEstudiantesConPagador(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator;

    public function paginatePagadores(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator;

    public function pagosPorContacto(int $contactoId): Collection;

    public function findById(int $id): Pago;

    public function create(array $data): Pago;

    public function update(Pago $pago, array $data): Pago;

    public function delete(Pago $pago): void;
}