<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioClase extends Model
{
    protected $table = 'horario_clases';
    protected $primaryKey = 'horario_clase_id';

    protected $fillable = [
        'seccion_id',
        'curso_id',
        'docente_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'aula',
        'anio_escolar',
        'periodo',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'dia_semana' => 'integer',
        'anio_escolar' => 'integer',
    ];

    // Relaciones
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class, 'seccion_id', 'seccion_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id', 'curso_id');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'docente_id', 'docente_id');
    }

    // Scopes
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorSeccion($query, int $seccionId)
    {
        return $query->where('seccion_id', $seccionId);
    }

    public function scopePorDocente($query, int $docenteId)
    {
        return $query->where('docente_id', $docenteId);
    }

    public function scopePorDia($query, int $dia)
    {
        return $query->where('dia_semana', $dia);
    }

    public function scopeAnioActual($query)
    {
        return $query->where('anio_escolar', date('Y'));
    }

    public function scopePorAnio($query, int $anio)
    {
        return $query->where('anio_escolar', $anio);
    }

    // Accessors
    public function getNombreDiaAttribute(): string
    {
        $dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        return $dias[$this->dia_semana] ?? '';
    }

    public function getDuracionMinutosAttribute(): int
    {
        $inicio = strtotime($this->hora_inicio);
        $fin = strtotime($this->hora_fin);
        return ($fin - $inicio) / 60;
    }

    public function getHoraInicioFormateadaAttribute(): string
    {
        return substr($this->hora_inicio, 0, 5);
    }

    public function getHoraFinFormateadaAttribute(): string
    {
        return substr($this->hora_fin, 0, 5);
    }
}
