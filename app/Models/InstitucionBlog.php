<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstitucionBlog extends Model
{
    protected $table      = 'institucion_blog';
    protected $primaryKey = 'blo_id';
    public $timestamps    = false; // Legacy table doesn't have Laravel timestamps

    protected $fillable = [
        'blo_titulo',
        'blo_contenido',
        'blo_imagen',
        'blo_fecha',
        'insti_id',
        'usuario_id',
        'blo_estatus',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
