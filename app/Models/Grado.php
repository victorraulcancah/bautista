<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grado extends Model
{
    protected $table = 'grados';
    protected $primaryKey = 'grado_id';

    protected $fillable = ['nivel_id', 'nombre_grado', 'abreviatura'];

    public function nivel(): BelongsTo
    {
        return $this->belongsTo(NivelEducativo::class, 'nivel_id', 'nivel_id');
    }

    public function secciones(): HasMany
    {
        return $this->hasMany(Seccion::class, 'id_grado', 'grado_id');
    }

    // Relación directa (para cursos creados directamente en el grado)
    public function cursos(): HasMany
    {
        return $this->hasMany(Curso::class, 'grado_academico', 'grado_id');
    }

    // Relación N:M a través de grados_cursos (para cursos asignados)
    public function cursosAsignados(): BelongsToMany
    {
        return $this->belongsToMany(
            Curso::class,
            'grados_cursos',
            'id_grado',
            'id_curso',
            'grado_id',
            'curso_id'
        )
        ->withPivot('grac_id', 'grac_estado')
        ->wherePivot('grac_estado', 1)
        ->withTimestamps();
    }
}
