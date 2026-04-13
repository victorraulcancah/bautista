<?php

namespace App\Repositories\Implements;

use App\Models\User;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Repositories\Interfaces\FotocheckRepositoryInterface;
use Illuminate\Support\Collection;

class FotocheckRepository implements FotocheckRepositoryInterface
{
    /**
     * @inheritDoc
     */
    public function findEstudianteById(int $id): ?Estudiante
    {
        return Estudiante::with([
            'perfil', 
            'user', 
            'matriculas' => fn($q) => $q->latest()->with('seccion.grado')
        ])->find($id);
    }

    /**
     * @inheritDoc
     */
    public function findDocenteById(int $id): ?Docente
    {
        return Docente::with(['perfil', 'user'])->where('docente_id', $id)->first();
    }

    /**
     * @inheritDoc
     */
    public function findUserById(int $id): User
    {
        return User::with(['perfil', 'roles'])->findOrFail($id);
    }

    /**
     * @inheritDoc
     */
    public function getEstudiantesForBulk(int $aperturaId, int $nivelId): Collection
    {
        return Estudiante::with(['perfil', 'user'])
            ->whereHas('matriculas', function ($query) use ($aperturaId, $nivelId) {
                $query->where('apertura_id', $aperturaId)
                      ->whereHas('seccion.grado', function ($q) use ($nivelId) {
                          $q->where('nivel_id', $nivelId);
                      });
            })
            ->orderBy('estu_id')
            ->get();
    }
}
