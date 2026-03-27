<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstitucionGaleria extends Model
{
    protected $table      = 'institucion_galeria';
    protected $primaryKey = 'gal_id';

    protected $fillable = [
        'insti_id',
        'gal_nombre',
        'gal_posicion',
        'gal_estatus',
    ];

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }
}
