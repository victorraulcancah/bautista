<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNivelEducativoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombre_nivel'  => ['required', 'string', 'max:50'],
            'nivel_estatus' => ['nullable', 'in:1,0'],
        ];
    }
}
