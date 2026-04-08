<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Medio extends Model
{
    protected $table      = 'mis_medios';
    protected $primaryKey = 'id_medio';

    protected $fillable = [
        'user_id',
        'nombre',
        'tipo',
        'ruta',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
