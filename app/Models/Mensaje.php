<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mensaje extends Model
{
    protected $table    = 'mensajes';
    protected $fillable = [
        'insti_id', 'remitente_id', 'destinatario_id',
        'grupo_id', 'asunto', 'cuerpo', 'leido',
    ];

    protected $casts = ['leido' => 'boolean'];

    public function remitente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remitente_id');
    }

    public function destinatario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinatario_id');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(MensajeriaGrupo::class, 'grupo_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(MensajeRespuesta::class, 'mensaje_id')->orderBy('created_at');
    }
}
