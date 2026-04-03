<?php

namespace App\Repositories\Interfaces;

use App\Models\PagoNotifica;
use Illuminate\Database\Eloquent\Collection;

interface PagoNotificaRepositoryInterface
{
    public function porPago(int $pagId): Collection;
    public function findById(int $id): PagoNotifica;
    public function create(array $data): PagoNotifica;
    public function actualizarEstado(PagoNotifica $notifica, string $estado, ?string $comentario): PagoNotifica;
}
