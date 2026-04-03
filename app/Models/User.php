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

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'insti_id',
        'rol_id',
        'username',
        'name',
        'email',
        'password',
        'estado',
    ];

    protected $appends = ['nombre_completo', 'avatar'];

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

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function hasRole(string|array $roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        return in_array($this->rol?->name, $roles, true);
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->hasRole($roles);
    }

    public function assignRole(string $rolName): void
    {
        $rol = Role::where('name', $rolName)->firstOrFail();
        $this->update(['rol_id' => $rol->id]);
        $this->setRelation('rol', $rol);
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

    public function getAvatarAttribute(): ?string
    {
        $perfil = $this->perfil;
        if ($perfil && $perfil->foto_perfil) {
            return asset('storage/' . $perfil->foto_perfil);
        }
        return null;
    }
}
