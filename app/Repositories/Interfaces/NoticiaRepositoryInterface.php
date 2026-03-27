<?php

namespace App\Repositories\Interfaces;

use App\Models\InstitucionNoticia;
use Illuminate\Pagination\LengthAwarePaginator;

interface NoticiaRepositoryInterface
{
    public function paginate(int $instiId, string $search, int $perPage): LengthAwarePaginator;
    public function findById(int $id): InstitucionNoticia;
    public function create(array $data): InstitucionNoticia;
    public function update(int $id, array $data): InstitucionNoticia;
    public function delete(int $id): void;
}
