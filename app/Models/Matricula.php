<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Matricula extends Model
{
    protected $primaryKey = 'matricula_id';

    protected $fillable = [
        'apertura_id', 'estudiante_id', 'seccion_id', 'anio', 'estado',
    ];

    public function apertura(): BelongsTo
    {
        return $this->belongsTo(MatriculaApertura::class, 'apertura_id', 'apertura_id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id', 'estu_id');
    }

    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class, 'seccion_id', 'seccion_id');
    }
}
