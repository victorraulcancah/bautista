<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClaseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'titulo'      => ['required', 'string', 'max:200'],
            'descripcion' => ['nullable', 'string'],
            'orden'       => ['nullable', 'integer', 'min:1'],
            'estado'      => ['required', 'in:1,0'],
        ];
    }
}
