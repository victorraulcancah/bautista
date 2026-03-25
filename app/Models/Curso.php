<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Curso extends Model
{
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
}
