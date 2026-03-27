<?php

namespace App\Services\Interfaces;

use App\Models\Pago;
use App\Models\PadreApoderado;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PagoServiceInterface
{
    public function listarEstudiantesConPagador(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator;

    public function listarPagadores(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator;

    public function pagosPorContacto(int $contactoId): Collection;

    public function crearPago(array $data): Pago;

    public function actualizarPago(int $id, array $data): Pago;

    public function eliminarPago(int $id): void;
}