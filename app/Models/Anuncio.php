<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anuncio extends Model
{
    protected $table = 'anuncios';
    protected $fillable = ['docente_curso_id', 'titulo', 'contenido'];

    public function docenteCurso()
    {
        return $this->belongsTo(DocenteCurso::class, 'docente_curso_id');
    }
}
