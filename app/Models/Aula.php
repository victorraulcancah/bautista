<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    protected $table = 'aulas';
    protected $primaryKey = 'aula_id';

    protected $fillable = [
        'insti_id',
        'nombre',
        'capacidad',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo'    => 'boolean',
        'capacidad' => 'integer',
    ];

    // Scopes
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorInsti($query, int $instiId)
    {
        return $query->where('insti_id', $instiId);
    }
}
