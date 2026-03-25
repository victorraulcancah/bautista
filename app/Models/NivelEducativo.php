<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NivelEducativo extends Model
{
    protected $table      = 'niveles_educativos';
    protected $primaryKey = 'nivel_id';

    protected $fillable = ['insti_id', 'nombre_nivel', 'nivel_estatus'];

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }

    public function grados(): HasMany
    {
        return $this->hasMany(Grado::class, 'nivel_id', 'nivel_id');
    }
}
