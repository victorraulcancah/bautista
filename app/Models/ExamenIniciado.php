<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamenIniciado extends Model
{
    protected $table = 'examen_iniciado';
    protected $primaryKey = 'intento_id';

    protected $fillable = [
        'estu_id', 'actividad_id', 'fecha_inicio', 'fecha_limite', 'fecha_fin', 'estado', 'puntaje_total',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_limite' => 'datetime',
        'fecha_fin'    => 'datetime',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estu_id', 'estu_id');
    }

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(ActividadCurso::class, 'actividad_id', 'actividad_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(PreguntaRespuesta::class, 'intento_id', 'intento_id');
    }
}
