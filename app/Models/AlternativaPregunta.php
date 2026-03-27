<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlternativaPregunta extends Model
{
    protected $table = 'alternativas_pregunta';
    protected $primaryKey = 'alternativa_id';

    protected $fillable = ['id_pregunta', 'contenido', 'estado_res'];
}
