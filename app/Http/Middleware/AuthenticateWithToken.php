<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticateWithToken
{
    public function handle(Request $request, Closure $next)
    {
        // El token (cookie o Bearer) siempre tiene prioridad sobre la sesión,
        // así un nuevo login vía API reemplaza cualquier sesión anterior.
        $token = $request->bearerToken() ?? $request->cookie('auth_token');

        if ($token) {
            $personalAccessToken = PersonalAccessToken::findToken($token);

            if ($personalAccessToken) {
                Auth::login($personalAccessToken->tokenable);
                return $next($request);
            }
        }

        // Sin token válido, caer en la sesión PHP estándar (Fortify web login)
        if (Auth::check()) {
            return $next($request);
        }

        // Sin autenticación válida → redirigir al login
        return redirect()->route('login');
    }
}
