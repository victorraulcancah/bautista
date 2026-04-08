<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MensajePrivadoRespuesta extends Model
{
    protected $table = 'mensajes_privados_respuestas';

    protected $fillable = [
        'mensaje_privado_id',
        'user_id',
        'respuesta',
    ];

    public function mensajePrivado(): BelongsTo
    {
        return $this->belongsTo(MensajePrivado::class, 'mensaje_privado_id');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
