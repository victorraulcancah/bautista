<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActividadRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombre_actividad'  => 'sometimes|required|string|max:200',
            'id_tipo_actividad' => 'sometimes|required|integer',
            'descripcion_corta' => 'nullable|string',
            'descripcion_larga' => 'nullable|string',
            'fecha_inicio'      => 'nullable|date',
            'fecha_cierre'      => 'nullable|date',
            'nota_visible'      => 'nullable|in:0,1',
            'respuesta_visible' => 'nullable|in:0,1',
            'ocultar_actividad' => 'nullable|in:0,1',
            'estado'            => 'nullable|in:0,1',
            'es_calificado'     => 'nullable|in:0,1',
            'peso_porcentaje'   => 'nullable|numeric|min:0|max:100',
            'puntos_maximos'    => 'nullable|numeric|min:0',
            'nota_actividad'    => 'nullable|string',
            'allowed_formats'   => 'nullable|string',
        ];
    }
}
