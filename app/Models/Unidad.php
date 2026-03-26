<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unidad extends Model
{
    protected $primaryKey = 'unidad_id';

    protected $fillable = [
        'curso_id', 'titulo', 'descripcion', 'orden', 'estado',
    ];

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id', 'curso_id');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'unidad_id', 'unidad_id')->orderBy('orden');
    }
}
