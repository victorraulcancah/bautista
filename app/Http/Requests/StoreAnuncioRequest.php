<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnuncioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'docente_curso_id' => 'required|exists:docente_cursos,docen_curso_id',
            'titulo' => 'required|string|max:255',
            'contenido' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'docente_curso_id.required' => 'El curso es requerido',
            'docente_curso_id.exists' => 'El curso no existe',
            'titulo.required' => 'El título es requerido',
            'titulo.max' => 'El título no puede exceder 255 caracteres',
            'contenido.required' => 'El contenido es requerido',
        ];
    }
}
