<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAnuncioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'contenido' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es requerido',
            'titulo.max' => 'El título no puede exceder 255 caracteres',
            'contenido.required' => 'El contenido es requerido',
        ];
    }
}
