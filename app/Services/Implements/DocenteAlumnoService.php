<?php

namespace App\Services\Implements;

use App\Models\DocenteCurso;
use App\Models\NotaActividad;
use App\Models\AsistenciaAlumno;
use App\Models\ActividadCurso;
use App\Exceptions\DocenteNotFoundException;
use App\Exceptions\DocenteCursoNotFoundException;
use App\Repositories\Interfaces\DocenteRepositoryInterface;
use App\Repositories\Interfaces\MatriculaRepositoryInterface;
use App\Services\Interfaces\DocenteAlumnoServiceInterface;

class DocenteAlumnoService implements DocenteAlumnoServiceInterface
{
    public function __construct(
        protected DocenteRepositoryInterface $docenteRepo,
        protected MatriculaRepositoryInterface $matriculaRepo
    ) {}

    public function obtenerTodosAlumnos(int $usuarioId): array
    {
        $docente = $this->docenteRepo->findByUserId($usuarioId);
        
        if (!$docente) {
            throw new DocenteNotFoundException();
        }

        $seccionIds = DocenteCurso::where('docente_id', $docente->docente_id)
            ->pluck('seccion_id')
            ->unique()
            ->toArray();

        return $this->matriculaRepo->getMatriculasBySecciones($seccionIds)
            ->map(fn ($m) => [
                'estu_id'          => $m->estudiante?->estu_id,
                'doc_numero'       => $m->estudiante?->perfil?->doc_numero,
                'primer_nombre'    => $m->estudiante?->perfil?->primer_nombre,
                'segundo_nombre'   => $m->estudiante?->perfil?->segundo_nombre,
                'apellido_paterno' => $m->estudiante?->perfil?->apellido_paterno,
                'apellido_materno' => $m->estudiante?->perfil?->apellido_materno,
                'fecha_nacimiento' => $m->estudiante?->perfil?->fecha_nacimiento,
                'telefono'         => $m->estudiante?->perfil?->telefono,
                'direccion'        => $m->estudiante?->perfil?->direccion,
                'grado'            => $m->seccion?->grado?->nombre_grado,
                'seccion'          => $m->seccion?->nombre,
            ])
            ->unique('estu_id')
            ->values()
            ->toArray();
    }

    public function obtenerAlumnosSeccion(int $docenteCursoId): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }

        return $this->matriculaRepo->getMatriculasBySeccion($dc->seccion_id, $dc->apertura_id)
            ->toArray();
    }

    public function obtenerAlumnosConMetricas(int $docenteCursoId): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }
        
        $alumnos = $this->matriculaRepo->getMatriculasBySeccion($dc->seccion_id, $dc->apertura_id);
        $estuIds = $alumnos->pluck('estu_id');

        $cursoId = $dc->curso_id;

        $totalActividades = ActividadCurso::whereHas('clase.unidad', function($q) use ($cursoId) {
            $q->where('curso_id', $cursoId);
        })->count();

        // Optimize N+1: Load all relevant records for the whole group in two queries
        $todasLasNotas = NotaActividad::whereIn('estu_id', $estuIds)
            ->whereHas('actividad.clase.unidad', function($q) use ($cursoId) {
                $q->where('curso_id', $cursoId);
            })
            ->with('actividad')
            ->get()
            ->groupBy('estu_id');

        $todasLasAsistencias = AsistenciaAlumno::whereIn('id_estudiante', $estuIds)
            ->whereHas('session.clase.unidad', function($q) use ($cursoId) {
                $q->where('curso_id', $cursoId);
            })
            ->get()
            ->groupBy('id_estudiante');

        return $alumnos->map(function ($m) use ($cursoId, $totalActividades, $todasLasNotas, $todasLasAsistencias) {
            $estuId = $m->estu_id;
            $perfil = $m->estudiante?->perfil;

            // Use the grouped collections instead of queries parent loop
            $misNotas = $todasLasNotas->get($estuId, collect());
            
            $sumaPonderada = 0;
            foreach ($misNotas as $notaRec) {
                $actividad = $notaRec->actividad;
                if (!$actividad || !$actividad->es_calificado) continue;

                $puntosObtenidos = is_numeric($notaRec->nota) ? floatval($notaRec->nota) : 0;
                $puntosMaximos = floatval($actividad->puntos_maximos ?: 20);
                $peso = floatval($actividad->peso_porcentaje ?: 0);

                // Normalizar a escala 20: (obtenido/máximo) * 20
                $nota20 = ($puntosMaximos > 0) ? ($puntosObtenidos / $puntosMaximos) * 20 : 0;
                
                // Aplicar peso: nota20 * (peso/100)
                $sumaPonderada += ($nota20 * ($peso / 100));
            }
            
            $promedio = round($sumaPonderada, 2);

            $misAsistencias = $todasLasAsistencias->get($estuId, collect());
            $totalSesiones = $misAsistencias->count();
            $presentes = $misAsistencias->where('estado', 'P')->count();
            $asistencia = $totalSesiones > 0 ? round(($presentes / $totalSesiones) * 100, 2) : 100;

            $actividadesCompletadas = $misNotas->whereNotNull('nota')->where('nota', '!=', '')->count();
            $progreso = $totalActividades > 0 ? round(($actividadesCompletadas / $totalActividades) * 100, 2) : 0;

            return [
                'estu_id' => $estuId,
                'nombre' => $perfil?->nombre_ordenado,
                'foto' => $perfil?->foto ? '/storage/' . $perfil->foto : null,
                'promedio' => $promedio,
                'asistencia' => $asistencia,
                'progreso' => $progreso,
                'actividadesCompletadas' => $actividadesCompletadas,
                'actividadesTotales' => $totalActividades,
            ];
        })->toArray();
    }
}
