<?php

namespace App\Services\Interfaces;

use App\Models\Mensaje;
use App\Models\MensajeRespuesta;
use Illuminate\Pagination\LengthAwarePaginator;

interface MensajeServiceInterface
{
    public function bandeja(int $userId, int $instiId, int $perPage): LengthAwarePaginator;
    public function enviados(int $userId, int $instiId, int $perPage): LengthAwarePaginator;
    public function obtener(int $id, int $userId): Mensaje;
    public function enviar(int $instiId, int $remitenteId, array $data): Mensaje;
    public function responder(int $mensajeId, int $userId, string $respuesta): MensajeRespuesta;
    public function noLeidos(int $userId): int;
}
