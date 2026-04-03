<?php

namespace App\Services\Interfaces;

use App\Models\PagoNotifica;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface PagoNotificaServiceInterface
{
    public function listarPorPago(int $pagId): Collection;
    public function subirVoucher(int $pagId, int $userId, UploadedFile $archivo): PagoNotifica;
    public function validar(int $notificaId, string $estado, ?string $comentario): PagoNotifica;
}
