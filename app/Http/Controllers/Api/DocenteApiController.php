<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocenteRequest;
use App\Http\Requests\UpdateDocenteRequest;
use App\Http\Resources\DocenteResource;
use App\Models\DocenteCurso;
use App\Models\Matricula;
use App\Models\ActividadCurso;
use App\Services\Interfaces\DocenteServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Models\Anuncio;
use App\Models\AsistenciaAlumno;
use App\Models\NotaActividad;
use Illuminate\Support\Facades\DB;

class DocenteApiController extends Controller
{
    public function __construct(
        private readonly DocenteServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return DocenteResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function show(int $id): DocenteResource
    {
        return new DocenteResource($this->service->obtener($id));
    }

    public function store(StoreDocenteRequest $request): JsonResponse
    {
        return (new DocenteResource($this->service->crear($request->validated())))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateDocenteRequest $request, int $id): DocenteResource
    {
        return new DocenteResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);
        return response()->json(null, 204);
    }

    /**
     * Data for the teacher dashboard.
     */
    public function dashboard(Request $request)
    {
        $docente = \App\Models\Docente::where('id_usuario', $request->user()->id)->firstOrFail();
        $docenteId = $docente->docente_id;

        $misCursos = DocenteCurso::where('docente_id', $docenteId)
            ->with(['curso', 'seccion.grado'])
            ->get();

        $seccionesIds = $misCursos->pluck('seccion_id')->unique();
        
        $totalEstudiantes = Matricula::whereIn('seccion_id', $seccionesIds)
            ->where('estado', '1')
            ->count();

        // Contar entregas reales que no tienen nota asignada
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

        return response()->json([
            'resumen' => [
                'cursos' => $misCursos->count(),
                'estudiantes' => $totalEstudiantes,
                'pendientes_calificar' => $pendientesCalificar,
            ],
            'cursos' => $misCursos,
        ]);
    }

    /**
     * Detailed list of assigned courses.
     */
    public function misCursos(Request $request)
    {
        $docente = \App\Models\Docente::where('id_usuario', $request->user()->id)->firstOrFail();
        $docenteId = $docente->docente_id;

        $cursos = DocenteCurso::where('docente_id', $docenteId)
            ->with(['curso', 'seccion.grado.nivel', 'apertura'])
            ->get();

        return response()->json($cursos);
    }

    /**
     * Get the full content (units/classes) for a specific assignment.
     */
    public function cursoContenido(int $id)
    {
        // $id es el docen_curso_id
        $dc = DocenteCurso::findOrFail($id);

        $unidades = \App\Models\Unidad::where('curso_id', $dc->curso_id)
            ->with([
                'clases' => function ($q) {
                    $q->orderBy('orden')
                      ->with(['archivos', 'actividades.tipoActividad']);
                }
            ])
            ->orderBy('orden')
            ->get();

        return response()->json($unidades);
    }

    /**
     * Get announcements for a course.
     */
    public function getAnuncios(int $docenteCursoId)
    {
        $anuncios = Anuncio::where('docente_curso_id', $docenteCursoId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($anuncios);
    }

    /**
     * Create an announcement.
     */
    public function storeAnuncio(Request $request)
    {
        $validated = $request->validate([
            'docente_curso_id' => 'required|exists:docente_cursos,docen_curso_id',
            'titulo' => 'required|string|max:255',
            'contenido' => 'required|string',
        ]);

        $anuncio = Anuncio::create($validated);
        return response()->json($anuncio, 201);
    }

    /**
     * Update an announcement.
     */
    public function updateAnuncio(Request $request, int $id)
    {
        $anuncio = Anuncio::findOrFail($id);
        
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'contenido' => 'required|string',
        ]);

        $anuncio->update($validated);
        return response()->json($anuncio);
    }

    /**
     * Delete an announcement.
     */
    public function destroyAnuncio(int $id)
    {
        $anuncio = Anuncio::findOrFail($id);
        $anuncio->delete();
        return response()->json(null, 204);
    }

    /**
     * All unique students across all sections the teacher is assigned to.
     */
    public function misAlumnos(Request $request)
    {
        $docente = \App\Models\Docente::where('id_usuario', $request->user()->id)->firstOrFail();

        $seccionIds = DocenteCurso::where('docente_id', $docente->docente_id)
            ->pluck('seccion_id')
            ->unique();

        $alumnos = Matricula::whereIn('seccion_id', $seccionIds)
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
            ->values();

        return response()->json($alumnos);
    }

    /**
     * List students for a section to take attendance.
     */
    public function alumnosSeccion(Request $request, int $docenteCursoId)
    {
        $docenteCurso = DocenteCurso::findOrFail($docenteCursoId);
        $alumnos = \App\Models\Matricula::where('seccion_id', $docenteCurso->seccion_id)
            ->where('apertura_id', $docenteCurso->apertura_id)
            ->with('estudiante.perfil')
            ->get();

        return response()->json($alumnos);
    }

    /**
     * Start an attendance session for a class.
     */
    public function iniciarAsistencia(Request $request)
    {
        $validated = $request->validate([
            'id_clase_curso' => 'required|exists:clases,clase_id',
            'fecha' => 'required|date',
        ]);

        $session = \App\Models\AsistenciaActividad::firstOrCreate([
            'id_clase_curso' => $validated['id_clase_curso'],
            'fecha' => $validated['fecha'],
        ]);

        return response()->json($session);
    }

    /**
     * Bulk save attendance for students.
     */
    public function marcarAsistencia(Request $request, int $sessionId)
    {
        $validated = $request->validate([
            'asistencias' => 'required|array',
            'asistencias.*.id_estudiante' => 'required|exists:estudiantes,estu_id',
            'asistencias.*.estado' => 'required|string|max:1', // P, F, J, U
        ]);

        foreach ($validated['asistencias'] as $asistencia) {
            \App\Models\AsistenciaAlumno::updateOrCreate(
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

        return response()->json(['message' => 'Asistencia guardada con éxito.']);
    }



    /**
     * List students for a section with performance metrics.
     */
    public function alumnosConMetricas(Request $request, int $docenteCursoId)
    {
        $docenteCurso = DocenteCurso::findOrFail($docenteCursoId);
        $alumnos = \App\Models\Matricula::where('seccion_id', $docenteCurso->seccion_id)
            ->where('apertura_id', $docenteCurso->apertura_id)
            ->where('estado', '1')
            ->with(['estudiante.perfil'])
            ->get();

        $cursoId = $docenteCurso->curso_id;

        $data = $alumnos->map(function ($m) use ($cursoId, $docenteCursoId) {
            $estuId = $m->estu_id;

            // 1. Promedio de Notas (de actividades calificadas en este curso)
            $notas = NotaActividad::where('estu_id', $estuId)
                ->whereHas('actividad', function($q) use ($cursoId) {
                    $q->where('id_curso', $cursoId);
                })
                ->pluck('nota')
                ->map(fn($n) => is_numeric($n) ? floatval($n) : 0);
            
            $promedioNotas = $notas->count() > 0 ? round($notas->avg(), 2) : 0;

            // 2. Promedio de Asistencia (% de Presente sobre el total)
            $asistencias = AsistenciaAlumno::where('id_estudiante', $estuId)
                ->whereHas('session.clase.unidad', function($q) use ($cursoId) {
                    $q->where('curso_id', $cursoId);
                })
                ->get();

            $totalSesiones = $asistencias->count();
            $presentes = $asistencias->where('estado', 'P')->count();
            $porcentajeAsistencia = $totalSesiones > 0 ? round(($presentes / $totalSesiones) * 100, 2) : 100;

            return [
                'estu_id' => $estuId,
                'perfil' => [
                    'primer_nombre' => $m->estudiante?->perfil?->primer_nombre,
                    'apellido_paterno' => $m->estudiante?->perfil?->apellido_paterno,
                    'doc_numero' => $m->estudiante?->perfil?->doc_numero,
                ],
                'promedio_notas' => $promedioNotas,
                'asistencia_porcentaje' => $porcentajeAsistencia,
                'total_asistencias' => $totalSesiones,
            ];
        });

        return response()->json($data);
    }
    /**
     * Update course settings (weights, preferences).
     */
    public function updateSettings(Request $request, int $docenteCursoId)
    {
        $dc = DocenteCurso::findOrFail($docenteCursoId);
        
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $dc->update([
            'settings' => $validated['settings']
        ]);

        return response()->json([
            'message' => 'Configuración actualizada correctamente.',
            'settings' => $dc->settings
        ]);
    }

    /**
     * Returns a matrix of students and their attendance history.
     */
    public function asistenciaMatrix(int $docenteCursoId)
    {
        $dc = DocenteCurso::findOrFail($docenteCursoId);
        
        // 1. Get students in this specific section/period
        $alumnos = \App\Models\Matricula::where('seccion_id', $dc->seccion_id)
            ->where('apertura_id', $dc->apertura_id)
            ->where('estado', '1')
            ->with('estudiante.perfil')
            ->get();

        // 2. Get all classes for this course
        $clasesIds = \App\Models\Clase::whereHas('unidad', function($q) use ($dc) {
            $q->where('curso_id', $dc->curso_id);
        })->pluck('clase_id');

        // 3. Get all attendance sessions for these classes
        $sesiones = \App\Models\AsistenciaActividad::whereIn('id_clase_curso', $clasesIds)
            ->orderBy('fecha', 'asc')
            ->get();

        // 4. Get all records for these students and these sessions
        $registros = \App\Models\AsistenciaAlumno::whereIn('id_estudiante', $alumnos->pluck('estu_id'))
            ->whereIn('id_asistencia_clase', $sesiones->pluck('id'))
            ->get();

        return response()->json([
            'estudiantes' => $alumnos->map(fn($m) => [
                'estu_id' => $m->estu_id,
                'nombre' => $m->estudiante?->perfil?->primer_nombre . ' ' . $m->estudiante?->perfil?->apellido_paterno,
                'dni' => $m->estudiante?->perfil?->doc_numero,
                'registros' => $registros->where('id_estudiante', $m->estu_id)->values()
            ]),
            'sesiones' => $sesiones->map(fn($s) => [
                'id' => $s->id,
                'fecha' => $s->fecha,
                'clase_id' => $s->id_clase_curso
            ])
        ]);
    }
}
