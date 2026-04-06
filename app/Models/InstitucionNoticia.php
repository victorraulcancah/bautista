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
        'not_resumen',
        'not_mensaje',
        'not_contenido_html',
        'not_cita_autoridad',
        'not_cita_estudiante',
        'not_multimedia_json',
        'not_imagen',
        'not_lugar_evento',
        'not_fecha_evento',
        'not_fecha_publicacion',
        'not_fecha_expiracion',
        'not_fecha',
        'not_estatus',
        'autor',
    ];
}
