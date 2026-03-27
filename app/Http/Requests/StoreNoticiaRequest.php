<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoticiaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'not_titulo'  => ['required', 'string', 'max:200'],
            'not_mensaje' => ['nullable', 'string'],
            'not_fecha'   => ['nullable', 'date'],
            'imagen'      => ['nullable', 'image', 'max:10240'],
        ];
    }
}
