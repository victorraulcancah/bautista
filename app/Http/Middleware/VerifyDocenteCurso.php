<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Docente;
use App\Models\DocenteCurso;

class VerifyDocenteCurso
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Si es admin, dejamos pasar (puedes ajustar esto según tus roles)
        if ($user->hasRole('admin') || $user->hasRole('super-admin')) {
            return $next($request);
        }

        $docente = Docente::where('id_usuario', $user->id)->first();

        if (!$docente) {
            return response()->json(['message' => 'El usuario no tiene un perfil de docente asociado.'], 403);
        }

        // Intentamos obtener el ID del curso de diferentes formas comunes en las rutas
        $id = $request->route('id') 
            ?? $request->route('docenteCursoId') 
            ?? $request->input('docente_curso_id')
            ?? $request->input('docen_curso_id');

        // Si tenemos un ID de asignación (DocenteCurso)
        if ($id) {
            // Primero intentar como docen_curso_id directo
            $hasAccess = DocenteCurso::where('docente_id', $docente->docente_id)
                ->where('docen_curso_id', $id)
                ->exists();

            // Si no, puede ser un actividadId — resolver el curso_id desde la actividad
            if (!$hasAccess) {
                $cursoIdFromActividad = \App\Models\ActividadCurso::where('actividad_id', $id)->value('id_curso');
                if ($cursoIdFromActividad) {
                    $hasAccess = DocenteCurso::where('docente_id', $docente->docente_id)
                        ->where('curso_id', $cursoIdFromActividad)
                        ->exists();
                }
            }

            if (!$hasAccess) {
                return response()->json(['message' => 'No tienes permiso para acceder a este curso.'], 403);
            }
        }

        // Si la ruta pide curso_id directamente (por ejemplo en contenido)
        $cursoId = $request->route('cursoId') ?? $request->input('curso_id');
        if ($cursoId) {
            $hasAccess = DocenteCurso::where('docente_id', $docente->docente_id)
                ->where('curso_id', $cursoId)
                ->exists();

            if (!$hasAccess) {
                return response()->json(['message' => 'No estás asignado a este curso.'], 403);
            }
        }

        return $next($request);
    }
}
