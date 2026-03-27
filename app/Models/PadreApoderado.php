<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PadreApoderado extends Model
{
    protected $table = 'padre_apoderado';
    protected $primaryKey = 'id_contacto';

    protected $fillable = [
        'user_id',
        'insti_id',
        'nombres',
        'apellidos',
        'direccion',
        'departamento_id',
        'provincia_id',
        'distrito_id',
        'telefono_1',
        'telefono_2',
        'tipo_doc',
        'numero_doc',
        'genero',
        'fecha_nacimiento',
        'nacionalidad',
        'estado_civil',
        'es_pagador',
        'email_contacto',
        'estado',
        'foto_perfil',
        'facebook',
        'instagram',
        'tiktok',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }

    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(
            Estudiante::class,
            'estudiante_contacto',
            'contacto_id',
            'estudiante_id',
            'id_contacto',
            'estu_id',
        )->withPivot('mensualidad')->withTimestamps();
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'contacto_id', 'id_contacto');
    }
}
