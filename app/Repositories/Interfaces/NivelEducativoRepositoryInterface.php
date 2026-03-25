<?php

namespace App\Repositories\Interfaces;

use App\Models\NivelEducativo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface NivelEducativoRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function all(int $instiId): Collection;
    public function findById(int $id): NivelEducativo;
    public function create(array $data): NivelEducativo;
    public function update(NivelEducativo $nivel, array $data): NivelEducativo;
    public function delete(NivelEducativo $nivel): void;
}
