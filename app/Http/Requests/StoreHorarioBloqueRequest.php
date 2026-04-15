<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHorarioBloqueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:100',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'orden' => 'required|integer|min:1',
            'es_recreo' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del bloque es obligatorio',
            'nombre.max' => 'El nombre no puede exceder 100 caracteres',
            'hora_inicio.required' => 'La hora de inicio es obligatoria',
            'hora_inicio.date_format' => 'La hora de inicio debe tener formato HH:MM',
            'hora_fin.required' => 'La hora de fin es obligatoria',
            'hora_fin.date_format' => 'La hora de fin debe tener formato HH:MM',
            'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio',
            'orden.required' => 'El orden es obligatorio',
            'orden.min' => 'El orden debe ser mayor a 0',
        ];
    }
}
