<?php

namespace App\Repositories\Implements;

use App\Models\Estudiante;
use App\Models\Matricula;
use App\Models\MatriculaApertura;
use App\Repositories\Interfaces\MatriculaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MatriculaRepository implements MatriculaRepositoryInterface
{
    // ── Aperturas ────────────────────────────────────────────────────────────

    public function paginateAperturas(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return MatriculaApertura::withCount('matriculas')
            ->where('insti_id', $instiId)
            ->when($search, fn ($q) => $q
                ->where('nombre', 'like', "%{$search}%")
                ->orWhere('anio', 'like', "%{$search}%")
            )
            ->latest('apertura_id')
            ->paginate($perPage);
    }

    public function findAperturaById(int $id): MatriculaApertura
    {
        return MatriculaApertura::withCount('matriculas')->findOrFail($id);
    }

    public function createApertura(array $data): MatriculaApertura
    {
        return MatriculaApertura::create($data);
    }

    public function updateApertura(MatriculaApertura $apertura, array $data): MatriculaApertura
    {
        $apertura->update($data);
        return $apertura->loadCount('matriculas');
    }

    public function deleteApertura(MatriculaApertura $apertura): void
    {
        $apertura->delete();
    }

    // ── Matrículas ───────────────────────────────────────────────────────────

    public function paginateMatriculas(int $aperturaId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return Matricula::with(['estudiante.perfil', 'seccion'])
            ->where('apertura_id', $aperturaId)
            ->when($search, fn ($q) => $q->whereHas('estudiante.perfil', fn ($p) => $p
                ->where('primer_nombre', 'like', "%{$search}%")
                ->orWhere('apellido_paterno', 'like', "%{$search}%")
                ->orWhere('doc_numero', 'like', "%{$search}%")
            ))
            ->latest('matricula_id')
            ->paginate($perPage);
    }

    public function findMatriculaById(int $id): Matricula
    {
        return Matricula::with(['estudiante.perfil', 'seccion'])->findOrFail($id);
    }

    public function createMatricula(array $data): Matricula
    {
        $matricula = Matricula::create($data);
        return $matricula->load(['estudiante.perfil', 'seccion']);
    }

    public function deleteMatricula(Matricula $matricula): void
    {
        $matricula->delete();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function estudiantesNoMatriculados(int $instiId, int $aperturaId): Collection
    {
        $yaMatriculados = Matricula::where('apertura_id', $aperturaId)
            ->pluck('estudiante_id');

        return Estudiante::with('perfil')
            ->where('insti_id', $instiId)
            ->where('estado', '1')
            ->whereNotIn('estu_id', $yaMatriculados)
            ->get();
    }
}
