<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSeccionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_grado'    => ['required', 'exists:grados,grado_id'],
            'nombre'      => ['required', 'string', 'max:50'],
            'abreviatura' => ['nullable', 'string', 'max:5'],
            'cnt_alumnos' => ['nullable', 'integer', 'min:0'],
            'horario'     => ['nullable', 'string', 'max:255'],
        ];
    }
}
