<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoticiaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'not_titulo'  => ['sometimes', 'string', 'max:200'],
            'not_mensaje' => ['nullable', 'string'],
            'not_fecha'   => ['nullable', 'date'],
            'imagen'      => ['nullable', 'image', 'max:10240'],
        ];
    }
}
