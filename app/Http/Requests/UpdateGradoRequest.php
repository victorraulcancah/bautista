<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGradoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nivel_id'     => ['required', 'exists:niveles_educativos,nivel_id'],
            'nombre_grado' => ['required', 'string', 'max:200'],
            'abreviatura'  => ['nullable', 'string', 'max:100'],
        ];
    }
}
