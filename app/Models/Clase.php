<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clase extends Model
{
    protected $primaryKey = 'clase_id';

    protected $fillable = [
        'unidad_id', 'titulo', 'descripcion', 'orden', 'estado',
    ];

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'unidad_id', 'unidad_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(ArchivoClase::class, 'clase_id', 'clase_id');
    }

    public function actividades(): HasMany
    {
        return $this->hasMany(ActividadCurso::class, 'id_clase_curso', 'clase_id');
    }
}
