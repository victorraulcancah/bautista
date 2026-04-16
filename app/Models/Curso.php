<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Curso extends Model
{
    protected $table = 'cursos';
    protected $primaryKey = 'curso_id';

    protected $fillable = [
        'id_insti', 'nombre', 'descripcion', 'logo',
        'nivel_academico_id', 'grado_academico', 'estado',
    ];

    public function nivel(): BelongsTo
    {
        return $this->belongsTo(NivelEducativo::class, 'nivel_academico_id', 'nivel_id');
    }

    public function grado(): BelongsTo
    {
        return $this->belongsTo(Grado::class, 'grado_academico', 'grado_id');
    }

    public function unidades(): HasMany
    {
        return $this->hasMany(Unidad::class, 'curso_id', 'curso_id')->orderBy('orden');
    }

    public function docenteCursos(): HasMany
    {
        return $this->hasMany(DocenteCurso::class, 'curso_id', 'curso_id');
    }
}
