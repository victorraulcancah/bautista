<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pag_monto'    => ['required', 'numeric', 'min:0'],
            'pag_nombre1'  => ['nullable', 'string', 'max:50'],
            'pag_otro1'    => ['nullable', 'numeric', 'min:0'],
            'pag_nombre2'  => ['nullable', 'string', 'max:50'],
            'pag_otro2'    => ['nullable', 'numeric', 'min:0'],
            'pag_notifica' => ['nullable', 'in:SI,NO'],
            'pag_fecha'    => ['nullable', 'date'],
        ];
    }
}