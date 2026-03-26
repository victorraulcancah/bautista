<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClaseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'unidad_id'   => ['required', 'exists:unidades,unidad_id'],
            'titulo'      => ['required', 'string', 'max:200'],
            'descripcion' => ['nullable', 'string'],
            'orden'       => ['nullable', 'integer', 'min:1'],
        ];
    }
}
