<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Verifica que el usuario autenticado tenga uno de los roles indicados.
 *
 * Uso en rutas:
 *   ->middleware('check.role:docente')
 *   ->middleware('check.role:padre_familia|madre_familia|apoderado')
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string $roles): mixed
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'No autenticado.');
        }

        $rolesArray = explode('|', $roles);

        if (! $user->hasAnyRole($rolesArray)) {
            abort(403, 'No tienes permiso para acceder a esta sección.');
        }

        return $next($request);
    }
}
