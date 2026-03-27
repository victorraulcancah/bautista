<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitucionNoticia extends Model
{
    protected $table      = 'institucion_noticias';
    protected $primaryKey = 'not_id';

    protected $fillable = [
        'insti_id',
        'not_titulo',
        'not_mensaje',
        'not_imagen',
        'not_fecha',
        'not_estatus',
    ];
}
