<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioBloque extends Model
{
    protected $table = 'horario_bloques';
    protected $primaryKey = 'bloque_id';

    protected $fillable = [
        'insti_id',
        'nombre',
        'hora_inicio',
        'hora_fin',
        'orden',
        'es_recreo',
    ];

    protected $casts = [
        'es_recreo' => 'boolean',
        'orden' => 'integer',
    ];

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }

    public function scopeOrdenado($query)
    {
        return $query->orderBy('orden');
    }

    public function scopePorInstitucion($query, int $instiId)
    {
        return $query->where('insti_id', $instiId);
    }
}
