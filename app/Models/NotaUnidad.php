<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotaUnidad extends Model
{
    protected $table = 'nota_unidad';

    protected $fillable = [
        'estu_id', 'unidad_id', 'nota_final', 'estado',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estu_id', 'estu_id');
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'unidad_id', 'unidad_id');
    }
}
