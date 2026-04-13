<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionFotocheck extends Model
{
    protected $fillable = [
        'primary_color',
        'secondary_color',
        'text_color',
        'logo_path',
        'footer_text',
        'is_active'
    ];
}
