<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAulaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'      => 'nullable|string|max:100',
            'capacidad'   => 'nullable|integer|min:1|max:500',
            'descripcion' => 'nullable|string|max:255',
            'activo'      => 'nullable|boolean',
        ];
    }
}
