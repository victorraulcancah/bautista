<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatriculaApertura extends Model
{
    protected $primaryKey = 'apertura_id';

    protected $fillable = [
        'insti_id', 'nombre', 'anio', 'fecha_inicio', 'fecha_fin', 'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
    ];

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }

    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class, 'apertura_id', 'apertura_id');
    }
}
