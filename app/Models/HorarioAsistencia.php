<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioAsistencia extends Model
{
    protected $primaryKey = 'horario_id';

    protected $fillable = [
        'insti_id', 'nivel_id', 'tipo_usuario', 'turno',
        'hora_ingreso', 'hora_salida',
    ];

    public function nivel(): BelongsTo
    {
        return $this->belongsTo(NivelEducativo::class, 'nivel_id', 'nivel_id');
    }

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }
}
