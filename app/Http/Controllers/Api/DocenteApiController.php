<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IniciarAsistenciaRequest;
use App\Http\Requests\MarcarAsistenciaBatchRequest;
use App\Http\Requests\StoreAnuncioRequest;
use App\Http\Requests\StoreDocenteRequest;
use App\Http\Requests\UpdateAnuncioRequest;
use App\Http\Requests\UpdateCursoSettingsRequest;
use App\Http\Requests\UpdateDocenteRequest;
use App\Http\Resources\AlumnoMetricasResource;
use App\Http\Resources\AnuncioResource;
use App\Http\Resources\DocenteCursoResource;
use App\Http\Resources\DocenteResource;
use App\Services\Interfaces\DocenteCursoServiceInterface;
use App\Services\Interfaces\DocenteServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DocenteApiController extends Controller
{
    public function __construct(
        private readonly DocenteServiceInterface $docenteService,
        private readonly DocenteCursoServiceInterface $docenteCursoService,
    ) {}

    /**
     * List all teachers.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return DocenteResource::collection($this->docenteService->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    /**
     * Show a specific teacher.
     */
    public function show(int $id): DocenteResource
    {
        return new DocenteResource($this->docenteService->obtener($id));
    }

    /**
     * Create a new teacher.
     */
    public function store(StoreDocenteRequest $request): JsonResponse
    {
        return (new DocenteResource($this->docenteService->crear($request->validated())))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update a teacher.
     */
    public function update(UpdateDocenteRequest $request, int $id): DocenteResource
    {
        return new DocenteResource($this->docenteService->actualizar($id, $request->validated()));
    }

    /**
     * Delete a teacher.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->docenteService->eliminar($id);
        return response()->json(null, 204);
    }

    /**
     * Get dashboard data for the authenticated teacher.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $data = $this->docenteCursoService->obtenerDashboard($request->user()->id);
        return response()->json($data);
    }

    /**
     * Get all courses assigned to the authenticated teacher.
     */
    public function misCursos(Request $request): JsonResponse
    {
        $cursos = $this->docenteCursoService->obtenerCursosDocente($request->user()->id);
        return response()->json($cursos);
    }

    /**
     * Get course content (units/classes) for a specific assignment.
     */
    public function cursoContenido(int $id): JsonResponse
    {
        $contenido = $this->docenteCursoService->obtenerContenidoCurso($id);
        return response()->json($contenido);
    }

    /**
     * Get announcements for a course.
     */
    public function getAnuncios(int $id): AnonymousResourceCollection
    {
        $anuncios = $this->docenteCursoService->obtenerAnuncios($id);
        return AnuncioResource::collection($anuncios);
    }

    /**
     * Create an announcement.
     */
    public function storeAnuncio(StoreAnuncioRequest $request): JsonResponse
    {
        $anuncio = $this->docenteCursoService->crearAnuncio($request->validated());
        return (new AnuncioResource($anuncio))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an announcement.
     */
    public function updateAnuncio(UpdateAnuncioRequest $request, int $id): AnuncioResource
    {
        $anuncio = $this->docenteCursoService->actualizarAnuncio($id, $request->validated());
        return new AnuncioResource($anuncio);
    }

    /**
     * Delete an announcement.
     */
    public function destroyAnuncio(int $id): JsonResponse
    {
        $this->docenteCursoService->eliminarAnuncio($id);
        return response()->json(null, 204);
    }

    /**
     * Get all students for the authenticated teacher across all sections.
     */
    public function misAlumnos(Request $request): JsonResponse
    {
        $alumnos = $this->docenteCursoService->obtenerTodosAlumnos($request->user()->id);
        return response()->json($alumnos);
    }

    /**
     * Get students for a specific section.
     */
    public function alumnosSeccion(Request $request, int $docenteCursoId): JsonResponse
    {
        $alumnos = $this->docenteCursoService->obtenerAlumnosSeccion($docenteCursoId);
        return response()->json($alumnos);
    }

    /**
     * Get students with detailed metrics for the Alumnos tab.
     */
    public function alumnosDetallados(int $docenteCursoId): AnonymousResourceCollection
    {
        $alumnos = $this->docenteCursoService->obtenerAlumnosConMetricas($docenteCursoId);
        return AlumnoMetricasResource::collection($alumnos);
    }

    /**
     * Get attendance matrix for a course.
     */
    public function asistenciaMatrix(Request $request, int $docenteCursoId): JsonResponse
    {
        $desde = $request->input('desde');
        $hasta = $request->input('hasta');
        
        $matriz = $this->docenteCursoService->obtenerMatrizAsistencia($docenteCursoId, $desde, $hasta);
        return response()->json($matriz);
    }

    /**
     * Export attendance to Excel.
     */
    public function exportarAsistencia(Request $request, int $docenteCursoId)
    {
        $desde = $request->input('desde');
        $hasta = $request->input('hasta');
        
        $tempFile = $this->docenteCursoService->exportarAsistencia($docenteCursoId, $desde, $hasta);
        
        $fileName = 'asistencia_' . date('Y-m-d') . '.xlsx';
        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Export students list to Excel.
     */
    public function exportarAlumnos(int $docenteCursoId)
    {
        $tempFile = $this->docenteCursoService->exportarAlumnos($docenteCursoId);
        
        $fileName = 'alumnos_' . date('Y-m-d') . '.xlsx';
        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Update course settings.
     */
    public function updateSettings(UpdateCursoSettingsRequest $request, int $id): JsonResponse
    {
        $result = $this->docenteCursoService->actualizarConfiguracion($id, $request->validated()['settings']);
        return response()->json($result);
    }

    /**
     * Start an attendance session.
     */
    public function iniciarAsistencia(IniciarAsistenciaRequest $request): JsonResponse
    {
        $session = $this->docenteCursoService->iniciarSesionAsistencia($request->validated());
        return response()->json($session);
    }

    /**
     * Mark attendance for students.
     */
    public function marcarAsistencia(MarcarAsistenciaBatchRequest $request, int $sessionId): JsonResponse
    {
        $this->docenteCursoService->marcarAsistencia($sessionId, $request->validated()['asistencias']);
        return response()->json(['message' => 'Asistencia guardada con éxito.']);
    }

    /**
     * Get students with performance metrics (legacy method - kept for compatibility).
     */
    public function alumnosConMetricas(Request $request, int $docenteCursoId): JsonResponse
    {
        $alumnos = $this->docenteCursoService->obtenerAlumnosConMetricas($docenteCursoId);
        return response()->json($alumnos);
    }
}
