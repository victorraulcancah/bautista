<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarcarAsistenciaBatchRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'registros'              => ['required', 'array', 'min:1'],
            'registros.*.id_persona' => ['required', 'integer'],
            'registros.*.tipo'       => ['required', 'in:E,D'],
            'registros.*.fecha'      => ['required', 'date_format:Y-m-d'],
            'registros.*.estado'     => ['required', 'in:1,0,T'],
            'registros.*.turno'      => ['nullable', 'in:M,T'],
            'registros.*.hora_entrada' => ['nullable', 'date_format:H:i'],
            'registros.*.hora_salida'  => ['nullable', 'date_format:H:i'],
            'registros.*.observacion'  => ['nullable', 'string', 'max:300'],
        ];
    }
}
