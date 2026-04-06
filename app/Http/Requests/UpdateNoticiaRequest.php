<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoticiaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'not_titulo'            => ['sometimes', 'string', 'max:200'],
            'not_resumen'           => ['nullable', 'string'],
            'not_mensaje'           => ['nullable', 'string'],
            'not_contenido_html'    => ['nullable', 'string'],
            'not_cita_autoridad'    => ['nullable', 'string'],
            'not_cita_estudiante'   => ['nullable', 'string'],
            'not_lugar_evento'      => ['nullable', 'string', 'max:255'],
            'not_fecha_evento'      => ['nullable', 'date'],
            'not_fecha_publicacion' => ['nullable', 'date'],
            'not_fecha_expiracion'  => ['nullable', 'date'],
            'autor'                 => ['nullable', 'string', 'max:100'],
            'imagen'                => ['nullable', 'image', 'max:10240'],
            'not_multimedia_json'   => ['nullable', 'json'],
        ];
    }
}
