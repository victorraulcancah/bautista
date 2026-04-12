<?php

namespace App\Repositories\Interfaces;

use App\Models\User;
use App\Models\Estudiante;
use App\Models\Docente;
use Illuminate\Support\Collection;

interface FotocheckRepositoryInterface
{
    /**
     * Find a student by ID with profile and user.
     */
    public function findEstudianteById(int $id): ?Estudiante;

    /**
     * Find a teacher by ID with profile and user.
     */
    public function findDocenteById(int $id): ?Docente;

    /**
     * Find a user by ID with profile and roles.
     */
    public function findUserById(int $id): User;

    /**
     * Get all students for bulk generation by opening and level.
     */
    public function getEstudiantesForBulk(int $aperturaId, int $nivelId): Collection;
}
