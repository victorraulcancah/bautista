<?php

namespace App\Services\Implements;

use App\Exceptions\AnuncioNotFoundException;
use App\Exceptions\DocenteCursoNotFoundException;
use App\Exceptions\DocenteNotFoundException;
use App\Models\Anuncio;
use App\Models\AsistenciaActividad;
use App\Models\AsistenciaAlumno;
use App\Models\ActividadCurso;
use App\Models\Docente;
use App\Models\DocenteCurso;
use App\Models\Matricula;
use App\Models\NotaActividad;
use App\Models\Unidad;
use App\Services\Interfaces\DocenteCursoServiceInterface;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class DocenteCursoService implements DocenteCursoServiceInterface
{
    public function obtenerDashboard(int $usuarioId): array
    {
        $docente = Docente::where('id_usuario', $usuarioId)->first();
        
        if (!$docente) {
            throw new DocenteNotFoundException();
        }

        $misCursos = DocenteCurso::where('docente_id', $docente->docente_id)
            ->with(['curso', 'seccion.grado'])
            ->get();

        $seccionesIds = $misCursos->pluck('seccion_id')->unique();
        
        $totalEstudiantes = Matricula::whereIn('seccion_id', $seccionesIds)
            ->where('estado', '1')
            ->count();

        $pendientesCalificar = NotaActividad::whereIn('actividad_id', function($query) use ($misCursos) {
                $query->select('actividad_id')
                    ->from('actividad_curso')
                    ->whereIn('id_curso', $misCursos->pluck('curso_id'));
            })
            ->whereNotNull('archivo_entrega')
            ->where(function($q) {
                $q->whereNull('nota')->orWhere('nota', '');
            })
            ->count();

        return [
            'resumen' => [
                'cursos' => $misCursos->count(),
                'estudiantes' => $totalEstudiantes,
                'pendientes_calificar' => $pendientesCalificar,
            ],
            'cursos' => $misCursos,
        ];
    }

    public function obtenerCursosDocente(int $usuarioId): \Illuminate\Database\Eloquent\Collection
    {
        $docente = Docente::where('id_usuario', $usuarioId)->first();
        
        if (!$docente) {
            throw new DocenteNotFoundException();
        }

        return DocenteCurso::where('docente_id', $docente->docente_id)
            ->with(['curso', 'seccion.grado.nivel', 'apertura'])
            ->get();
    }

    public function obtenerContenidoCurso(int $docenteCursoId): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }

        return Unidad::where('curso_id', $dc->curso_id)
            ->with([
                'clases' => function ($q) {
                    $q->orderBy('orden')
                      ->with(['archivos', 'actividades.tipoActividad']);
                }
            ])
            ->orderBy('orden')
            ->get()
            ->toArray();
    }

    public function obtenerAnuncios(int $docenteCursoId): \Illuminate\Database\Eloquent\Collection
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }

        return Anuncio::where('docente_curso_id', $docenteCursoId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function crearAnuncio(array $data): object
    {
        $dc = DocenteCurso::find($data['docente_curso_id']);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }

        return Anuncio::create($data);
    }

    public function actualizarAnuncio(int $anuncioId, array $data): object
    {
        $anuncio = Anuncio::find($anuncioId);
        
        if (!$anuncio) {
            throw new AnuncioNotFoundException();
        }

        $anuncio->update($data);
        return $anuncio->fresh();
    }

    public function eliminarAnuncio(int $anuncioId): void
    {
        $anuncio = Anuncio::find($anuncioId);
        
        if (!$anuncio) {
            throw new AnuncioNotFoundException();
        }

        $anuncio->delete();
    }

    public function obtenerTodosAlumnos(int $usuarioId): array
    {
        $docente = Docente::where('id_usuario', $usuarioId)->first();
        
        if (!$docente) {
            throw new DocenteNotFoundException();
        }

        $seccionIds = DocenteCurso::where('docente_id', $docente->docente_id)
            ->pluck('seccion_id')
            ->unique();

        return Matricula::whereIn('seccion_id', $seccionIds)
            ->where('estado', '1')
            ->with(['estudiante.perfil', 'seccion.grado'])
            ->get()
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
        $docenteCurso = DocenteCurso::find($docenteCursoId);
        
        if (!$docenteCurso) {
            throw new DocenteCursoNotFoundException();
        }

        return Matricula::where('seccion_id', $docenteCurso->seccion_id)
            ->where('apertura_id', $docenteCurso->apertura_id)
            ->with('estudiante.perfil')
            ->get()
            ->toArray();
    }

    public function obtenerAlumnosConMetricas(int $docenteCursoId): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }
        
        $alumnos = Matricula::where('seccion_id', $dc->seccion_id)
            ->where('apertura_id', $dc->apertura_id)
            ->where('estado', '1')
            ->with(['estudiante.perfil'])
            ->get();

        $cursoId = $dc->curso_id;

        $totalActividades = ActividadCurso::whereHas('clase.unidad', function($q) use ($cursoId) {
            $q->where('curso_id', $cursoId);
        })->count();

        return $alumnos->map(function ($m) use ($cursoId, $totalActividades) {
            $estuId = $m->estu_id;
            $perfil = $m->estudiante?->perfil;

            // Average grade
            $notas = NotaActividad::where('estu_id', $estuId)
                ->whereHas('actividad.clase.unidad', function($q) use ($cursoId) {
                    $q->where('curso_id', $cursoId);
                })
                ->whereNotNull('nota')
                ->where('nota', '!=', '')
                ->pluck('nota')
                ->map(fn($n) => is_numeric($n) ? floatval($n) : 0);
            
            $promedio = $notas->count() > 0 ? round($notas->avg(), 2) : 0;

            // Attendance percentage
            $asistencias = AsistenciaAlumno::where('id_estudiante', $estuId)
                ->whereHas('session.clase.unidad', function($q) use ($cursoId) {
                    $q->where('curso_id', $cursoId);
                })
                ->get();

            $totalSesiones = $asistencias->count();
            $presentes = $asistencias->where('estado', 'P')->count();
            $asistencia = $totalSesiones > 0 ? round(($presentes / $totalSesiones) * 100, 2) : 100;

            // Progress
            $actividadesCompletadas = NotaActividad::where('estu_id', $estuId)
                ->whereHas('actividad.clase.unidad', function($q) use ($cursoId) {
                    $q->where('curso_id', $cursoId);
                })
                ->whereNotNull('nota')
                ->where('nota', '!=', '')
                ->count();

            $progreso = $totalActividades > 0 ? round(($actividadesCompletadas / $totalActividades) * 100, 2) : 0;

            return [
                'estu_id' => $estuId,
                'nombre' => trim(($perfil?->apellido_paterno ?? '') . ' ' . 
                               ($perfil?->apellido_materno ?? '') . ', ' . 
                               ($perfil?->primer_nombre ?? '')),
                'foto' => $perfil?->foto ? '/storage/' . $perfil->foto : null,
                'promedio' => $promedio,
                'asistencia' => $asistencia,
                'progreso' => $progreso,
                'actividadesCompletadas' => $actividadesCompletadas,
                'actividadesTotales' => $totalActividades,
            ];
        })->toArray();
    }

    public function obtenerMatrizAsistencia(int $docenteCursoId, ?string $desde = null, ?string $hasta = null): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }
        
        $alumnos = Matricula::where('seccion_id', $dc->seccion_id)
            ->where('apertura_id', $dc->apertura_id)
            ->where('estado', '1')
            ->with('estudiante.perfil')
            ->get();

        $clasesIds = \App\Models\Clase::whereHas('unidad', function($q) use ($dc) {
            $q->where('curso_id', $dc->curso_id);
        })->pluck('clase_id');

        $sesionesQuery = AsistenciaActividad::whereIn('id_clase_curso', $clasesIds);
        
        if ($desde) {
            $sesionesQuery->where('fecha', '>=', $desde);
        }
        if ($hasta) {
            $sesionesQuery->where('fecha', '<=', $hasta);
        }
        
        $sesiones = $sesionesQuery->orderBy('fecha', 'asc')->get();

        $registros = AsistenciaAlumno::whereIn('id_estudiante', $alumnos->pluck('estu_id'))
            ->whereIn('id_asistencia_clase', $sesiones->pluck('id'))
            ->get();

        // Statistics
        $totalClases = $sesiones->count();
        $totalEstudiantes = $alumnos->count();
        $totalPresentes = $registros->where('estado', 'P')->count();
        $totalFaltas = $registros->where('estado', 'F')->count();
        $promedioAsistencia = $totalClases > 0 && $totalEstudiantes > 0 
            ? round(($totalPresentes / ($totalClases * $totalEstudiantes)) * 100, 2) 
            : 0;

        $records = $sesiones->map(function($sesion) use ($registros, $alumnos) {
            return [
                'fecha' => $sesion->fecha,
                'estudiantes' => $alumnos->map(function($m) use ($registros, $sesion) {
                    $registro = $registros->where('id_asistencia_clase', $sesion->id)
                        ->where('id_estudiante', $m->estu_id)
                        ->first();
                    
                    return [
                        'estu_id' => $m->estu_id,
                        'nombre' => trim(($m->estudiante?->perfil?->apellido_paterno ?? '') . ' ' . 
                                       ($m->estudiante?->perfil?->apellido_materno ?? '') . ', ' . 
                                       ($m->estudiante?->perfil?->primer_nombre ?? '')),
                        'estado' => $registro?->estado ?? 'P',
                        'observacion' => $registro?->observacion,
                    ];
                })->values()
            ];
        })->values();

        return [
            'records' => $records->toArray(),
            'stats' => [
                'totalClases' => $totalClases,
                'totalEstudiantes' => $totalEstudiantes,
                'promedioAsistencia' => $promedioAsistencia,
                'totalFaltas' => $totalFaltas,
            ]
        ];
    }

    public function exportarAsistencia(int $docenteCursoId, ?string $desde = null, ?string $hasta = null): string
    {
        $dc = DocenteCurso::with(['curso', 'seccion.grado'])->findOrFail($docenteCursoId);
        $matrixData = $this->obtenerMatrizAsistencia($docenteCursoId, $desde, $hasta);
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Asistencia');

        $sheet->setCellValue('A1', 'CURSO:');
        $sheet->setCellValue('B1', $dc->curso->nombre);
        $sheet->setCellValue('A2', 'GRADO:');
        $sheet->setCellValue('B2', $dc->seccion->grado->nombre_grado . ' - ' . $dc->seccion->nombre);
        $sheet->getStyle('A1:A2')->getFont()->setBold(true);

        $sheet->setCellValue('A4', 'FECHA');
        $sheet->setCellValue('B4', 'ESTUDIANTE');
        $sheet->setCellValue('C4', 'ESTADO');
        $sheet->setCellValue('D4', 'OBSERVACIÓN');
        $sheet->getStyle('A4:D4')->getFont()->setBold(true);
        $sheet->getStyle('A4:D4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE0E0E0');

        $row = 5;
        foreach ($matrixData['records'] as $record) {
            foreach ($record['estudiantes'] as $estudiante) {
                $sheet->setCellValue('A' . $row, $record['fecha']);
                $sheet->setCellValue('B' . $row, $estudiante['nombre']);
                $sheet->setCellValue('C' . $row, $estudiante['estado']);
                $sheet->setCellValue('D' . $row, $estudiante['observacion'] ?? '');
                $row++;
            }
        }

        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'asistencia_' . str_replace(' ', '_', $dc->curso->nombre) . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($tempFile);

        return $tempFile;
    }

    public function exportarAlumnos(int $docenteCursoId): string
    {
        $dc = DocenteCurso::with(['curso', 'seccion.grado'])->findOrFail($docenteCursoId);
        $alumnosData = $this->obtenerAlumnosConMetricas($docenteCursoId);
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Lista de Alumnos');

        $sheet->setCellValue('A1', 'CURSO:');
        $sheet->setCellValue('B1', $dc->curso->nombre);
        $sheet->setCellValue('A2', 'GRADO:');
        $sheet->setCellValue('B2', $dc->seccion->grado->nombre_grado . ' - ' . $dc->seccion->nombre);
        $sheet->getStyle('A1:A2')->getFont()->setBold(true);

        $sheet->setCellValue('A4', 'ID');
        $sheet->setCellValue('B4', 'ESTUDIANTE');
        $sheet->setCellValue('C4', 'PROMEDIO');
        $sheet->setCellValue('D4', 'ASISTENCIA %');
        $sheet->setCellValue('E4', 'PROGRESO %');
        $sheet->setCellValue('F4', 'ACTIVIDADES COMPLETADAS');
        $sheet->getStyle('A4:F4')->getFont()->setBold(true);
        $sheet->getStyle('A4:F4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE0E0E0');

        $row = 5;
        foreach ($alumnosData as $alumno) {
            $sheet->setCellValue('A' . $row, $alumno['estu_id']);
            $sheet->setCellValue('B' . $row, $alumno['nombre']);
            $sheet->setCellValue('C' . $row, $alumno['promedio']);
            $sheet->setCellValue('D' . $row, $alumno['asistencia']);
            $sheet->setCellValue('E' . $row, $alumno['progreso']);
            $sheet->setCellValue('F' . $row, $alumno['actividadesCompletadas'] . '/' . $alumno['actividadesTotales']);
            $row++;
        }

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'alumnos_' . str_replace(' ', '_', $dc->curso->nombre) . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($tempFile);

        return $tempFile;
    }

    public function actualizarConfiguracion(int $docenteCursoId, array $settings): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }

        $dc->update(['settings' => $settings]);

        return [
            'message' => 'Configuración actualizada correctamente.',
            'settings' => $dc->fresh()->settings
        ];
    }

    public function iniciarSesionAsistencia(array $data): object
    {
        return AsistenciaActividad::firstOrCreate([
            'id_clase_curso' => $data['id_clase_curso'],
            'fecha' => $data['fecha'],
        ]);
    }

    public function marcarAsistencia(int $sessionId, array $asistencias): void
    {
        foreach ($asistencias as $asistencia) {
            AsistenciaAlumno::updateOrCreate(
                [
                    'id_asistencia_clase' => $sessionId,
                    'id_estudiante' => $asistencia['id_estudiante']
                ],
                [
                    'estado' => $asistencia['estado'],
                    'observacion' => $asistencia['observacion'] ?? null,
                ]
            );
        }
    }
}
