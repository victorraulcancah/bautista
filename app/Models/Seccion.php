<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seccion extends Model
{
    protected $primaryKey = 'seccion_id';

    protected $fillable = ['id_grado', 'nombre', 'abreviatura', 'cnt_alumnos', 'horario'];

    public function grado(): BelongsTo
    {
        return $this->belongsTo(Grado::class, 'id_grado', 'grado_id');
    }
}
