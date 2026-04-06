<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ComunicadoComentario extends Model
{
    protected $table = 'comunicado_comentarios';

    protected $fillable = [
        'user_id',
        'commentable_id',
        'commentable_type',
        'contenido',
        'parent_id',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(ComunicadoComentario::class, 'parent_id')->with('usuario.perfil');
    }

    public function padre(): BelongsTo
    {
        return $this->belongsTo(ComunicadoComentario::class, 'parent_id');
    }
}
