<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMatriculaAperturaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombre'       => ['required', 'string', 'max:100'],
            'anio'         => ['required', 'integer', 'min:2000', 'max:2100'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin'    => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'estado'       => ['required', 'in:1,0'],
        ];
    }
}
