<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotaEstudiante extends Model
{
    protected $table = 'notas_estudiante';

    protected $fillable = [
        'estu_id', 'curso_id', 'año_lectivo', 'promedio_final',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estu_id', 'estu_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id', 'curso_id');
    }
}
