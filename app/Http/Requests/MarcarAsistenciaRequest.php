<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarcarAsistenciaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'id_persona'   => ['required', 'integer'],
            'tipo'         => ['required', 'in:E,D'],
            'fecha'        => ['required', 'date_format:Y-m-d'],
            'estado'       => ['required', 'in:1,0,T'],
            'turno'        => ['nullable', 'in:M,T'],
            'hora_entrada' => ['nullable', 'date_format:H:i'],
            'hora_salida'  => ['nullable', 'date_format:H:i'],
            'observacion'  => ['nullable', 'string', 'max:300'],
        ];
    }
}
