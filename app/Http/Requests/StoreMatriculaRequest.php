<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMatriculaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'apertura_id'   => ['required', 'exists:matricula_aperturas,apertura_id'],
            'estudiante_id' => ['required', 'exists:estudiantes,estu_id'],
            'seccion_id'    => ['nullable', 'exists:secciones,seccion_id'],
            'anio'          => ['required', 'integer', 'min:2000', 'max:2100'],
        ];
    }

    public function messages(): array
    {
        return [
            'estudiante_id.required' => 'Debes seleccionar un estudiante.',
            'apertura_id.exists'     => 'La apertura de matrícula no es válida.',
        ];
    }
}
