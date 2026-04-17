<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAulaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'      => 'required|string|max:100',
            'capacidad'   => 'nullable|integer|min:1|max:500',
            'descripcion' => 'nullable|string|max:255',
            'activo'      => 'nullable|boolean',
        ];
    }
}
