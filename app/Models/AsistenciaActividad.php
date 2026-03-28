<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AsistenciaActividad extends Model
{
    protected $table = 'asistencia_clases'; // Mapping to the current migration name for consistency
    protected $fillable = ['id_clase_curso', 'fecha', 'estado'];

    public function clase(): BelongsTo
    {
        return $this->belongsTo(Clase::class, 'id_clase_curso', 'clase_id');
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(AsistenciaAlumno::class, 'id_asistencia_clase', 'id');
    }
}
