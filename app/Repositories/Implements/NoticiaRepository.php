<?php

namespace App\Repositories\Implements;

use App\Models\InstitucionNoticia;
use App\Repositories\Interfaces\NoticiaRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class NoticiaRepository implements NoticiaRepositoryInterface
{
    public function paginate(int $instiId, string $search, int $perPage): LengthAwarePaginator
    {
        return InstitucionNoticia::where('insti_id', $instiId)
            ->where('not_estatus', 1)
            ->when($search, fn ($q) => $q->where('not_titulo', 'like', "%{$search}%"))
            ->orderByDesc('not_fecha')
            ->orderByDesc('not_id')
            ->paginate($perPage);
    }

    public function findById(int $id): InstitucionNoticia
    {
        return InstitucionNoticia::findOrFail($id);
    }

    public function create(array $data): InstitucionNoticia
    {
        return InstitucionNoticia::create($data);
    }

    public function update(int $id, array $data): InstitucionNoticia
    {
        $noticia = $this->findById($id);
        $noticia->update($data);
        return $noticia->fresh();
    }

    public function delete(int $id): void
    {
        $noticia = $this->findById($id);
        $noticia->update(['not_estatus' => 0]);
    }
}
