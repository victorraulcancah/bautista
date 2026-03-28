<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PreguntaCuestionario extends Model
{
    protected $table = 'pregunta_cuestionario';
    protected $primaryKey = 'pregunta_id';

    protected $fillable = [
        'id_cuestionario', 'cabecera', 'cuerpo', 'tipo_respuesta', 'valor_nota',
    ];

    public function cuestionario(): BelongsTo
    {
        return $this->belongsTo(Cuestionario::class, 'id_cuestionario', 'cuestionario_id');
    }

    public function alternativas(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AlternativaPregunta::class, 'id_pregunta', 'pregunta_id');
    }
}
