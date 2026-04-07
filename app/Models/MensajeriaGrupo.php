<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MensajeriaGrupo extends Model
{
    protected $table    = 'mensajeria_grupos';
    protected $fillable = ['insti_id', 'nombre', 'foto', 'docente_id'];

    public function miembros(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'mensajeria_grupo_miembros', 'grupo_id', 'user_id');
    }
}
