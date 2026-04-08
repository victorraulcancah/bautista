<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradoCurso extends Model
{
    protected $table = 'grados_cursos';
    protected $primaryKey = 'grac_id';

    protected $fillable = [
        'id_grado',
        'id_curso',
        'grac_estado',
    ];

    public function grado(): BelongsTo
    {
        return $this->belongsTo(Grado::class, 'id_grado', 'grado_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'id_curso', 'curso_id');
    }
}
