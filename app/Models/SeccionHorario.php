<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeccionHorario extends Model
{
    protected $table = 'seccion_horarios';
    protected $primaryKey = 'horario_archivo_id';

    protected $fillable = ['seccion_id', 'nombre', 'path', 'tipo', 'tamanio'];

    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class, 'seccion_id', 'seccion_id');
    }
}
