<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCursoSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => 'required|array',
        ];
    }

    public function messages(): array
    {
        return [
            'settings.required' => 'La configuración es requerida',
            'settings.array' => 'La configuración debe ser un objeto válido',
        ];
    }
}
