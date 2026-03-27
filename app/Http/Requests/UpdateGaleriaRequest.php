<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGaleriaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'imagen'       => ['nullable', 'image', 'max:5120'],
            'gal_posicion' => ['nullable', 'integer', 'min:1'],
            'gal_estatus'  => ['nullable', 'in:0,1'],
        ];
    }
}
