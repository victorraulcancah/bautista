<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medio extends Model
{
    protected $table      = 'mis_medios';
    protected $primaryKey = 'id_medio';

    protected $fillable = [
        'user_id',
        'carpeta_id',
        'es_carpeta',
        'nombre',
        'tipo',
        'ruta',
    ];

    protected $casts = [
        'es_carpeta' => 'boolean',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function carpetaPadre(): BelongsTo
    {
        return $this->belongsTo(Medio::class, 'carpeta_id', 'id_medio');
    }

    public function contenido(): HasMany
    {
        return $this->hasMany(Medio::class, 'carpeta_id', 'id_medio');
    }

    // Scope para obtener solo carpetas
    public function scopeCarpetas($query)
    {
        return $query->where('es_carpeta', true);
    }

    // Scope para obtener solo archivos
    public function scopeArchivos($query)
    {
        return $query->where('es_carpeta', false);
    }
}
