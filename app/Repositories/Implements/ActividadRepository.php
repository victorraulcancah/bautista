<?php

namespace App\Repositories\Implements;

use App\Models\ActividadCurso;
use App\Repositories\Interfaces\ActividadRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ActividadRepository implements ActividadRepositoryInterface
{
    public function paginate(int $cursoId, string $search = '', int $perPage = 20): LengthAwarePaginator
    {
        return ActividadCurso::with(['tipoActividad', 'clase', 'cuestionario'])
            ->where('id_curso', $cursoId)
            ->when($search, fn ($q) => $q->where('nombre_actividad', 'like', "%{$search}%"))
            ->latest('actividad_id')
            ->paginate($perPage);
    }

    public function findById(int $id): ActividadCurso
    {
        return ActividadCurso::with(['tipoActividad', 'clase', 'cuestionario.preguntas.alternativas'])->findOrFail($id);
    }

    public function create(array $data): ActividadCurso
    {
        return \DB::transaction(function() use ($data) {
            $config = $data['config'] ?? null;
            unset($data['config']);

            // 1. Create the main activity
            $actividad = ActividadCurso::create($data);

            // 2. If it's a questionnaire or exam, save the questions/alternatives
            if ($config && isset($config['questions'])) {
                $cuestionario = \App\Models\Cuestionario::create([
                    'id_actividad'      => $actividad->actividad_id,
                    'duracion'          => $config['duracion'] ?? 0,
                    'nota_visible'      => ($config['show_correct_answer'] ?? $config['show_grade'] ?? false) ? '1' : '0',
                    'mostrar_respuesta' => ($config['show_correct_answer'] ?? $config['show_grade'] ?? false) ? '1' : '0',
                    'estado'            => '1',
                ]);

                foreach ($config['questions'] as $qData) {
                    $tipoNombre = $qData['tipo_respuesta'] ?? 'multiple';
                    $tipoId = \DB::table('tipo_respuesta_quiz')->where('nombre', $tipoNombre)->value('tipo_id');
                    
                    if (!$tipoId) {
                        $tipoId = \DB::table('tipo_respuesta_quiz')->insertGetId([
                            'nombre' => $tipoNombre,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }

                    $pregunta = $cuestionario->preguntas()->create([
                        'cabecera'       => $qData['cabecera'] ?? 'Sin título',
                        'cuerpo'         => $qData['cabecera'] ?? '',
                        'tipo_respuesta' => $tipoId,
                        'valor_nota'     => $qData['valor_nota'] ?? 0,
                        'recurso_imagen' => $qData['recurso_imagen'] ?? null,
                    ]);

                    if (isset($qData['alternativas']) && is_array($qData['alternativas'])) {
                        foreach ($qData['alternativas'] as $aData) {
                            $pregunta->alternativas()->create([
                                'contenido'  => $aData['contenido'] ?? '',
                                'estado_res' => ($aData['es_correcta'] ?? false) ? '1' : '0',
                            ]);
                        }
                    }
                }

                $actividad->load('cuestionario.preguntas.alternativas');
            }

            return $actividad;
        });
    }

    public function update(ActividadCurso $actividad, array $data): ActividadCurso
    {
        $actividad->update($data);
        return $actividad->fresh(['tipoActividad', 'clase', 'cuestionario']);
    }

    public function delete(ActividadCurso $actividad): void
    {
        $actividad->delete();
    }
}
