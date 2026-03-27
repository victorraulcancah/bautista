<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoActividad extends Model
{
    protected $table = 'tipo_actividad';
    protected $primaryKey = 'tipo_id';

    protected $fillable = ['nombre'];
}
