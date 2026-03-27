<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MensajeRespuesta extends Model
{
    protected $table    = 'mensajes_respuestas';
    protected $fillable = ['mensaje_id', 'user_id', 'respuesta'];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
