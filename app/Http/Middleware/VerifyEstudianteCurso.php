<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Estudiante;
use App\Models\Matricula;
use App\Models\DocenteCurso;

class VerifyEstudianteCurso
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Si es admin, dejamos pasar
        if ($user->hasRole('admin') || $user->hasRole('super-admin')) {
            return $next($request);
        }

        $estudiante = Estudiante::where('user_id', $user->id)->first();

        if (!$estudiante) {
            return response()->json(['message' => 'El usuario no tiene un perfil de estudiante asociado.'], 403);
        }

        // Obtener la matrícula activa
        $matricula = Matricula::where('estu_id', $estudiante->estu_id)
            ->where('estado', '1')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$matricula) {
            return response()->json(['message' => 'No tienes una matrícula activa.'], 403);
        }

        // El ID puede venir como docenteCursoId (ID de asignación), cursoId o claseId
        $id = $request->route('id') 
            ?? $request->route('docenteCursoId') 
            ?? $request->input('docente_curso_id')
            ?? $request->input('docen_curso_id');

        if ($id) {
            // Caso 1: El ID es una CLASE (ruta alumno/clase/{id})
            if ($request->is('api/alumno/clase/*')) {
                $clase = \App\Models\Clase::with('unidad')->find($id);
                if ($clase && $clase->unidad) {
                    $hasAccess = DocenteCurso::where('curso_id', $clase->unidad->curso_id)
                        ->where('seccion_id', $matricula->seccion_id)
                        ->where(function ($q) use ($matricula) {
                            $q->where('apertura_id', $matricula->apertura_id)
                              ->orWhereNull('apertura_id');
                        })
                        ->exists();

                    if (!$hasAccess) {
                        return response()->json(['message' => 'No tienes acceso a la clase de este curso.'], 403);
                    }
                    return $next($request);
                }
            }

            // Caso 2: El ID es una ACTIVIDAD (ruta alumno/actividad/{id}/...)
            if ($request->is('api/alumno/actividad/*')) {
                $cursoIdFromActividad = \App\Models\ActividadCurso::where('actividad_id', $id)->value('id_curso');
                if ($cursoIdFromActividad) {
                    $hasAccess = DocenteCurso::where('curso_id', $cursoIdFromActividad)
                        ->where('seccion_id', $matricula->seccion_id)
                        ->where(function ($q) use ($matricula) {
                            $q->where('apertura_id', $matricula->apertura_id)
                              ->orWhereNull('apertura_id');
                        })
                        ->exists();
                    if (!$hasAccess) {
                        return response()->json(['message' => 'No tienes acceso a este recurso.'], 403);
                    }
                    return $next($request);
                }
            }

            // Caso 3: El ID es un ID de asignación (DocenteCurso)
            $hasAccess = DocenteCurso::where('docen_curso_id', $id)
                ->where('seccion_id', $matricula->seccion_id)
                ->where(function ($q) use ($matricula) {
                    $q->where('apertura_id', $matricula->apertura_id)
                      ->orWhereNull('apertura_id');
                })
                ->exists();

            if (!$hasAccess) {
                $hasAccess = DocenteCurso::where('curso_id', $id)
                    ->where('seccion_id', $matricula->seccion_id)
                    ->where(function ($q) use ($matricula) {
                        $q->where('apertura_id', $matricula->apertura_id)
                          ->orWhereNull('apertura_id');
                    })
                    ->exists();
                
                if (!$hasAccess) {
                    return response()->json(['message' => 'No tienes acceso a este recurso.'], 403);
                }
            }
        }

        $cursoId = $request->route('cursoId') ?? $request->input('curso_id');
        if ($cursoId) {
            // Verificar si el curso está disponible para la sección del alumno
            $hasAccess = DocenteCurso::where('curso_id', $cursoId)
                ->where('seccion_id', $matricula->seccion_id)
                ->where(function ($q) use ($matricula) {
                    $q->where('apertura_id', $matricula->apertura_id)
                      ->orWhereNull('apertura_id');
                })
                ->exists();

            if (!$hasAccess) {
                return response()->json(['message' => 'Este curso no está disponible para tu sección.'], 403);
            }
        }

        return $next($request);
    }
}
