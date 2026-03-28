<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cuestionario extends Model
{
    protected $table = 'cuestionario';
    protected $primaryKey = 'cuestionario_id';

    protected $fillable = [
        'id_actividad', 'duracion', 'nota_visible', 'mostrar_respuesta', 'estado',
    ];

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(ActividadCurso::class, 'id_actividad', 'actividad_id');
    }

    public function preguntas(): HasMany
    {
        return $this->hasMany(PreguntaCuestionario::class, 'id_cuestionario', 'cuestionario_id');
    }
}
