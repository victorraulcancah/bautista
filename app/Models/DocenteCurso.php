<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocenteCurso extends Model
{
    protected $table = 'docente_cursos';
    protected $primaryKey = 'docen_curso_id';

    protected $fillable = [
        'docente_id', 'apertura_id', 'curso_id',
        'nivel_id', 'grado_id', 'seccion_id', 'estado', 'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'docente_id', 'docente_id');
    }

    public function apertura(): BelongsTo
    {
        return $this->belongsTo(MatriculaApertura::class, 'apertura_id', 'apertura_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id', 'curso_id');
    }

    public function nivel(): BelongsTo
    {
        return $this->belongsTo(NivelEducativo::class, 'nivel_id', 'nivel_id');
    }

    public function grado(): BelongsTo
    {
        return $this->belongsTo(Grado::class, 'grado_id', 'grado_id');
    }

    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class, 'seccion_id', 'seccion_id');
    }
}
