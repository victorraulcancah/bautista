<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActividadCurso;
use App\Models\DocenteCurso;
use App\Models\Matricula;
use App\Models\NotaActividad;
use App\Models\Unidad;
use App\Models\Clase;
use App\Models\Estudiante;
use Illuminate\Http\Request;

class AlumnoApiController extends Controller
{
    /**
     * Data for the student dashboard.
     */
    public function dashboard(Request $request)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'No se encontró perfil de estudiante.'], 404);
        }

        $matricula = Matricula::where('estu_id', $estudiante->estu_id)
            ->where('estado', '1')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$matricula) {
            return response()->json(['message' => 'No se encontró matrícula activa.'], 404);
        }

        $seccionId = $matricula->seccion;
        $aperturaId = $matricula->id_apertura_mtr;

        // Active courses for this section
        $cursosCount = DocenteCurso::where('seccion_id', $seccionId)
            ->where('id_apertura', $aperturaId)
            ->count();

        // Next pending activities
        $proximasActividades = ActividadCurso::where('fecha_cierre', '>', now())
            ->whereHas('clase.unidad', function ($q) use ($seccionId, $aperturaId) {
                // Filter by section and period logic if needed
            })
            ->orderBy('fecha_cierre', 'asc')
            ->limit(5)
            ->get();

        // Recent grades
        $ultimasNotas = NotaActividad::where('estu_id', $estudiante->estu_id)
            ->with('actividad')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'resumen' => [
                'cursos' => $cursosCount,
                'pendientes' => count($proximasActividades),
                'asistencia' => 95,
            ],
            'actividades' => $proximasActividades,
            'notas' => $ultimasNotas,
            'matricula' => $matricula,
        ]);
    }

    /**
     * List courses for the student.
     */
    public function cursos(Request $request)
    {
        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->first();

        $matricula = Matricula::where('estu_id', $estudiante?->estu_id)
            ->where('estado', '1')
            ->first();

        if (!$matricula) return response()->json([]);

        $docenteCursos = DocenteCurso::where('seccion_id', $matricula->seccion)
            ->where('id_apertura', $matricula->id_apertura_mtr)
            ->with(['curso', 'docente.perfil'])
            ->get();

        return response()->json($docenteCursos);
    }

    /**
     * Details of a course: units and their classes.
     */
    public function cursoDetalle(Request $request, int $docenteCursoId)
    {
        $unidades = Unidad::where('docente_curso_id', $docenteCursoId)
            ->with(['clases'])
            ->orderBy('orden')
            ->get();

        return response()->json($unidades);
    }

    /**
     * Details of a class: materials and activities.
     */
    public function claseDetalle(Request $request, int $claseId)
    {
        $clase = Clase::where('clase_id', $claseId)
            ->with(['unidad.docenteCurso', 'archivos', 'actividades.tipoActividad'])
            ->firstOrFail();

        return response()->json($clase);
    }

    /**
     * Submit an activity (file upload).
     */
    public function entregarActividad(Request $request, int $actividadId)
    {
        $request->validate([
            'archivo' => 'required|file|max:10240',
        ]);

        $userId = $request->user()->id;
        $estudiante = Estudiante::where('user_id', $userId)->firstOrFail();

        $path = $request->file('archivo')->store('entregas_actividades', 'public');

        NotaActividad::updateOrCreate(
            ['actividad_id' => $actividadId, 'estu_id' => $estudiante->estu_id],
            ['archivo_entrega' => $path, 'fecha_entrega' => now()]
        );

        return response()->json(['message' => 'Entregado con éxito.']);
    }
}
