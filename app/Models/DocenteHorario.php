<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocenteHorario extends Model
{
    protected $table = 'docente_horarios';
    protected $primaryKey = 'horario_archivo_id';

    protected $fillable = ['docente_id', 'nombre', 'path', 'tipo', 'tamanio'];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'docente_id', 'docente_id');
    }
}
