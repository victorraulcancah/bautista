<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    protected $fillable = [
        'insti_id',
        'username',
        'name',
        'email',
        'password',
        'estado',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(InstitucionEducativa::class, 'insti_id', 'insti_id');
    }

    public function perfil(): HasOne
    {
        return $this->hasOne(Perfil::class, 'user_id');
    }

    public function padreApoderado(): HasOne
    {
        return $this->hasOne(PadreApoderado::class, 'user_id');
    }

    public function loginHistories(): HasMany
    {
        return $this->hasMany(LoginHistory::class, 'user_id');
    }

    public function isActivo(): bool
    {
        return $this->estado === '1';
    }

    public function isBloqueado(): bool
    {
        return $this->estado === '5';
    }

    public function getNombreCompletoAttribute(): string
    {
        $perfil = $this->perfil;
        if ($perfil) {
            return trim("{$perfil->primer_nombre} {$perfil->apellido_paterno} {$perfil->apellido_materno}");
        }
        return $this->name ?? $this->username;
    }
}
