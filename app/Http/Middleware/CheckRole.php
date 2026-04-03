<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\UnauthorizedException;

/**
 * Middleware de verificación de rol compatible con web (sesión) y API (sanctum token).
 *
 * Spatie's built-in `role:` middleware usa Auth::guard(null)->user() que apunta
 * al guard `web` (sesión). En rutas API autenticadas con sanctum el guard web
 * no tiene usuario, causando una excepción falsa de "no autenticado".
 *
 * Este middleware usa $request->user() que es resuelto por el guard activo
 * (web vía Auth::login() en AuthenticateWithToken, o sanctum en rutas API).
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
            throw UnauthorizedException::notLoggedIn();
        }

        $rolesArray = explode('|', $roles);

        if (! $user->hasAnyRole($rolesArray)) {
            throw UnauthorizedException::forRoles($rolesArray);
        }

        return $next($request);
    }
}
