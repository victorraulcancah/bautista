<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asistencia extends Model
{
    protected $primaryKey = 'asistencia_id';

    protected $fillable = [
        'insti_id', 'id_persona', 'tipo', 'fecha',
        'hora_entrada', 'hora_salida', 'turno', 'estado', 'observacion',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // ── Relaciones polimórficas manuales ──────────────────────────────────────

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'id_persona', 'estu_id');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'id_persona', 'docente_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_persona', 'id');
    }

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function getTurnoLabelAttribute(): string
    {
        return match($this->turno) {
            'M' => 'Mañana',
            'T' => 'Tarde',
            default => '—',
        };
    }

    public function getEstadoLabelAttribute(): string
    {
        return match($this->estado) {
            '1' => 'Asistió',
            '0' => 'Faltó',
            'T' => 'Tardanza',
            default => '—',
        };
    }
}
