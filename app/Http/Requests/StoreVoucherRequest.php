<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        // En un caso real, validaríamos que el usuario sea el padre del alumno asociado al pago.
        // Por simplicidad en esta etapa, permitimos si está autenticado (ya controlado por middleware sanctum).
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:2048', // 2MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'Debe seleccionar un archivo para el comprobante.',
            'archivo.mimes'    => 'Solo se permiten archivos JPG, PNG o PDF.',
            'archivo.max'      => 'El tamaño máximo del archivo es de 2MB.',
        ];
    }
}
