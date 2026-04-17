<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHorarioClaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Los permisos se manejan en middleware
    }

    public function rules(): array
    {
        return [
            'seccion_id' => 'required|exists:secciones,seccion_id',
            'curso_id' => 'required|exists:cursos,curso_id',
            'docente_id' => 'required|exists:docentes,docente_id',
            'bloque_id' => 'nullable|exists:horario_bloques,bloque_id',
            'dia_semana' => 'required|integer|min:1|max:7',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'aula'    => 'nullable|string|max:50',
            'aula_id' => 'nullable|exists:aulas,aula_id',
            'anio_escolar' => 'required|integer|min:2020|max:2100',
            'periodo' => 'nullable|string|max:1',
            'activo' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'seccion_id.required' => 'La sección es obligatoria',
            'seccion_id.exists' => 'La sección seleccionada no existe',
            'curso_id.required' => 'El curso es obligatorio',
            'curso_id.exists' => 'El curso seleccionado no existe',
            'docente_id.required' => 'El docente es obligatorio',
            'docente_id.exists' => 'El docente seleccionado no existe',
            'dia_semana.required' => 'El día de la semana es obligatorio',
            'dia_semana.min' => 'El día debe ser entre 1 (Lunes) y 7 (Domingo)',
            'dia_semana.max' => 'El día debe ser entre 1 (Lunes) y 7 (Domingo)',
            'hora_inicio.required' => 'La hora de inicio es obligatoria',
            'hora_fin.required' => 'La hora de fin es obligatoria',
            'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio',
            'anio_escolar.required' => 'El año escolar es obligatorio',
        ];
    }
}
