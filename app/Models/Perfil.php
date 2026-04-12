<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Perfil extends Model
{
    protected $table = 'perfiles';
    protected $primaryKey = 'perfil_id';

    protected $fillable = [
        'user_id',
        'genero',
        'primer_nombre',
        'segundo_nombre',
        'apellido_paterno',
        'apellido_materno',
        'tipo_doc',
        'doc_numero',
        'fecha_nacimiento',
        'fecha_registro',
        'direccion',
        'telefono',
        'foto_perfil',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'fecha_registro'   => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->primer_nombre} {$this->apellido_paterno} {$this->apellido_materno}");
    }

    public function getNombreOrdenadoAttribute(): string
    {
        return trim("{$this->apellido_paterno} {$this->apellido_materno}, {$this->primer_nombre}");
    }
}
