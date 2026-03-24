<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InstitucionEducativa extends Model
{
    protected $table = 'institucion_educativa';
    protected $primaryKey = 'insti_id';

    protected $fillable = [
        'insti_ruc',
        'insti_razon_social',
        'insti_direccion',
        'insti_telefono1',
        'insti_telefono2',
        'insti_email',
        'insti_director',
        'insti_ndni',
        'insti_logo',
        'insti_estatus',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'insti_id', 'insti_id');
    }
}
