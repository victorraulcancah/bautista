<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagoNotifica extends Model
{
    protected $table = 'pago_notifica';

    protected $fillable = [
        'pag_id',
        'user_id',
        'archivo',
        'estado',
        'comentario',
    ];

    protected $casts = [
        'estado' => 'string',
    ];

    public function pago(): BelongsTo
    {
        return $this->belongsTo(Pago::class, 'pag_id', 'pag_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
