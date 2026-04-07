<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCursoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombre'             => ['required', 'string', 'max:100'],
            'descripcion'        => ['nullable', 'string'],
            'nivel_academico_id' => ['nullable', 'exists:niveles_educativos,nivel_id'],
            'grado_academico'    => ['nullable', 'exists:grados,grado_id'],
            'estado'             => ['nullable', 'in:1,0'],
            'logo'               => ['nullable', 'image', 'max:2048'],
        ];
    }
}
