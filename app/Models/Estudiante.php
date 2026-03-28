<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estudiante extends Model
{
    protected $table = 'estudiantes';
    protected $primaryKey = 'estu_id';

    protected $fillable = [
        'insti_id',
        'perfil_id',
        'user_id',
        'estado',
        'foto',
        'colegio',
        'neurodivergencia',
        'terapia_ocupacional',
        'edad',
        'talla',
        'peso',
        'seguro',
        'privado',
        'redes',
        'facebook',
        'instagram',
        'tiktok',
        'fecha_ingreso',
        'fecha_promovido',
        'mensualidad',
    ];

    protected $casts = [
        'fecha_ingreso'   => 'date',
        'fecha_promovido' => 'date',
        'peso'            => 'decimal:2',
        'mensualidad'     => 'decimal:2',
    ];

    public function perfil(): BelongsTo
    {
        return $this->belongsTo(Perfil::class, 'perfil_id', 'perfil_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }

    public function contactos(): BelongsToMany
    {
        return $this->belongsToMany(
            PadreApoderado::class,
            'estudiante_contacto',
            'estudiante_id',
            'contacto_id',
            'estu_id',
            'id_contacto',
        )->withPivot('mensualidad')->withTimestamps();
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'estudiante_id', 'estu_id');
    }

    public function getNombreCompletoAttribute(): string
    {
        if ($this->perfil) {
            return trim(implode(' ', array_filter([
                $this->perfil->primer_nombre,
                $this->perfil->apellido_paterno,
                $this->perfil->apellido_materno,
            ])));
        }
        return $this->user?->name ?? '—';
    }
}
