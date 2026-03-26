<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUnidadRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'curso_id'    => ['required', 'exists:cursos,curso_id'],
            'titulo'      => ['required', 'string', 'max:200'],
            'descripcion' => ['nullable', 'string'],
            'orden'       => ['nullable', 'integer', 'min:1'],
        ];
    }
}
