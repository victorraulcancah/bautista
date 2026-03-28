<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsistenciaAlumno extends Model
{
    protected $table = 'asistencia_alumnos';
    protected $fillable = ['id_asistencia_clase', 'id_estudiante', 'estado', 'observacion'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AsistenciaActividad::class, 'id_asistencia_clase', 'id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante', 'estu_id');
    }
}
