<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IniciarAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_clase_curso' => 'required|exists:clases,clase_id',
            'fecha' => 'required|date',
        ];
    }

    public function messages(): array
    {
        return [
            'id_clase_curso.required' => 'La clase es requerida',
            'id_clase_curso.exists' => 'La clase no existe',
            'fecha.required' => 'La fecha es requerida',
            'fecha.date' => 'La fecha debe ser válida',
        ];
    }
}
