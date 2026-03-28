<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreguntaRespuesta extends Model
{
    protected $table = 'pregunta_resp';
    protected $primaryKey = 'resp_id';

    protected $fillable = [
        'intento_id', 'pregunta_id', 'alternativa_id', 'respuesta_texto', 'es_correcta', 'puntaje',
    ];

    public function intento(): BelongsTo
    {
        return $this->belongsTo(ExamenIniciado::class, 'intento_id', 'intento_id');
    }

    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(PreguntaCuestionario::class, 'pregunta_id', 'pregunta_id');
    }

    public function alternativa(): BelongsTo
    {
        return $this->belongsTo(AlternativaPregunta::class, 'alternativa_id', 'alternativa_id');
    }
}
