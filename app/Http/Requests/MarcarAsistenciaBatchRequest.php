<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarcarAsistenciaBatchRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'asistencias'                  => ['required', 'array', 'min:1'],
            'asistencias.*.id_estudiante'  => ['required', 'integer', 'exists:estudiantes,estu_id'],
            'asistencias.*.estado'         => ['required', 'in:P,F,T,J'],
            'asistencias.*.observacion'    => ['nullable', 'string', 'max:300'],
        ];
    }
}
