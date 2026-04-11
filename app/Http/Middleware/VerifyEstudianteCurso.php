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

        // El ID puede venir como docenteCursoId (ID de asignación) o directamente como cursoId
        $id = $request->route('id') 
            ?? $request->route('docenteCursoId') 
            ?? $request->input('docente_curso_id')
            ?? $request->input('docen_curso_id');

        if ($id) {
            // Verificar si el estudiante pertenece a la sección/apertura de ese curso asignado
            $hasAccess = DocenteCurso::where('docen_curso_id', $id)
                ->where('seccion_id', $matricula->seccion_id)
                ->where('apertura_id', $matricula->apertura_id)
                ->exists();

            if (!$hasAccess) {
                return response()->json(['message' => 'No tienes acceso a este curso asignado.'], 403);
            }
        }

        $cursoId = $request->route('cursoId') ?? $request->input('curso_id');
        if ($cursoId) {
            // Verificar si el curso está disponible para la sección del alumno
            $hasAccess = DocenteCurso::where('curso_id', $cursoId)
                ->where('seccion_id', $matricula->seccion_id)
                ->where('apertura_id', $matricula->apertura_id)
                ->exists();

            if (!$hasAccess) {
                return response()->json(['message' => 'Este curso no está disponible para tu sección.'], 403);
            }
        }

        return $next($request);
    }
}
