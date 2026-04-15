<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHorarioClaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'seccion_id' => 'sometimes|exists:secciones,seccion_id',
            'curso_id' => 'sometimes|exists:cursos,curso_id',
            'docente_id' => 'sometimes|exists:docentes,docente_id',
            'dia_semana' => 'sometimes|integer|min:1|max:7',
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin' => 'sometimes|date_format:H:i',
            'aula' => 'nullable|string|max:50',
            'anio_escolar' => 'sometimes|integer|min:2020|max:2100',
            'periodo' => 'nullable|string|max:1',
            'activo' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'seccion_id.exists' => 'La sección seleccionada no existe',
            'curso_id.exists' => 'El curso seleccionado no existe',
            'docente_id.exists' => 'El docente seleccionado no existe',
            'dia_semana.min' => 'El día debe estar entre 1 (Lunes) y 7 (Domingo)',
            'dia_semana.max' => 'El día debe estar entre 1 (Lunes) y 7 (Domingo)',
            'hora_inicio.date_format' => 'La hora de inicio debe tener formato HH:MM',
            'hora_fin.date_format' => 'La hora de fin debe tener formato HH:MM',
            'anio_escolar.min' => 'El año escolar debe ser mayor a 2020',
            'anio_escolar.max' => 'El año escolar debe ser menor a 2100',
        ];
    }
}
