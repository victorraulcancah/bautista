<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotaActividad extends Model
{
    protected $table = 'nota_actividad_estudiante';

    protected $fillable = [
        'estu_id', 'actividad_id', 'nota', 'observacion', 'fecha_calificacion',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estu_id', 'estu_id');
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(ActividadCurso::class, 'actividad_id', 'actividad_id');
    }
}
