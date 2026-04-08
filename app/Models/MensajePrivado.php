<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MensajePrivado extends Model
{
    use SoftDeletes;

    protected $table = 'mensajes_privados';

    protected $fillable = [
        'remitente_id',
        'destinatario_id',
        'asunto',
        'cuerpo',
        'leido_remitente',
        'leido_destinatario',
        'archivado_remitente',
        'archivado_destinatario',
        'eliminado_remitente',
        'eliminado_destinatario',
        'destacado_remitente',
        'destacado_destinatario',
        'categoria',
        'leido_en',
    ];

    protected $casts = [
        'leido_remitente' => 'boolean',
        'leido_destinatario' => 'boolean',
        'archivado_remitente' => 'boolean',
        'archivado_destinatario' => 'boolean',
        'eliminado_remitente' => 'boolean',
        'eliminado_destinatario' => 'boolean',
        'destacado_remitente' => 'boolean',
        'destacado_destinatario' => 'boolean',
        'leido_en' => 'datetime',
    ];

    public function remitente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remitente_id');
    }

    public function destinatario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinatario_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(MensajePrivadoRespuesta::class, 'mensaje_privado_id')->orderBy('created_at');
    }

    /**
     * Scope para bandeja de entrada del usuario
     */
    public function scopeBandejaEntrada($query, int $userId)
    {
        return $query->where('destinatario_id', $userId)
            ->where('eliminado_destinatario', false)
            ->where('archivado_destinatario', false);
    }

    /**
     * Scope para mensajes enviados del usuario
     */
    public function scopeEnviados($query, int $userId)
    {
        return $query->where('remitente_id', $userId)
            ->where('eliminado_remitente', false);
    }

    /**
     * Scope para mensajes archivados
     */
    public function scopeArchivados($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('destinatario_id', $userId)
                ->where('archivado_destinatario', true)
                ->where('eliminado_destinatario', false);
        })->orWhere(function ($q) use ($userId) {
            $q->where('remitente_id', $userId)
                ->where('archivado_remitente', true)
                ->where('eliminado_remitente', false);
        });
    }

    /**
     * Scope para mensajes destacados
     */
    public function scopeDestacados($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('destinatario_id', $userId)
                ->where('destacado_destinatario', true)
                ->where('eliminado_destinatario', false);
        })->orWhere(function ($q) use ($userId) {
            $q->where('remitente_id', $userId)
                ->where('destacado_remitente', true)
                ->where('eliminado_remitente', false);
        });
    }

    /**
     * Scope para papelera
     */
    public function scopePapelera($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('destinatario_id', $userId)
                ->where('eliminado_destinatario', true);
        })->orWhere(function ($q) use ($userId) {
            $q->where('remitente_id', $userId)
                ->where('eliminado_remitente', true);
        });
    }
}
