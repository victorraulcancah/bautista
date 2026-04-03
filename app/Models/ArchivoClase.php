<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArchivoClase extends Model
{
    protected $table = 'archivos_clase';
    protected $primaryKey = 'archivo_id';

    protected $fillable = [
        'clase_id', 'nombre', 'path', 'tipo', 'tamanio',
    ];

    public function clase(): BelongsTo
    {
        return $this->belongsTo(Clase::class, 'clase_id', 'clase_id');
    }
}
