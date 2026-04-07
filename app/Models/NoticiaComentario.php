<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NoticiaComentario extends Model
{
    use HasFactory;

    protected $table = 'noticia_comentarios';

    protected $fillable = [
        'noticia_id',
        'user_id',
        'parent_id',
        'contenido',
    ];

    protected $with = ['user'];

    public function noticia(): BelongsTo
    {
        return $this->belongsTo(InstitucionNoticia::class, 'noticia_id', 'not_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(NoticiaComentario::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(NoticiaComentario::class, 'parent_id')->orderBy('created_at', 'asc');
    }
}
