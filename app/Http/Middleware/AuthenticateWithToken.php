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
        // Si ya hay sesión activa (Fortify), continuar
        if (Auth::check()) {
            return $next($request);
        }

        // Intentar autenticar con token Sanctum Bearer
        $token = $request->bearerToken();

        if ($token) {
            $personalAccessToken = PersonalAccessToken::findToken($token);

            if ($personalAccessToken) {
                Auth::setUser($personalAccessToken->tokenable);
                return $next($request);
            }
        }

        // Sin autenticación válida → redirigir al login
        return redirect()->route('login');
    }
}
