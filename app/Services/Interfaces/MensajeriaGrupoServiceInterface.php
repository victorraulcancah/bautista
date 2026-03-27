<?php

namespace App\Services\Interfaces;

use App\Models\MensajeriaGrupo;
use Illuminate\Support\Collection;

interface MensajeriaGrupoServiceInterface
{
    public function listar(int $userId, int $instiId): Collection;
    public function crear(int $instiId, int $docenteId, array $data): MensajeriaGrupo;
}
