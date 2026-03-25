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
        // Si ya hay sesión activa, continuar
        if (Auth::check()) {
            return $next($request);
        }

        // Intentar autenticar con token Bearer en headers
        $token = $request->bearerToken();

        // Si no hay Bearer token, intentar obtenerlo de la cookie
        if (!$token) {
            $token = $request->cookie('auth_token');
        }

        if ($token) {
            $personalAccessToken = PersonalAccessToken::findToken($token);

            if ($personalAccessToken) {
                Auth::login($personalAccessToken->tokenable);
                return $next($request);
            }
        }

        // Sin autenticación válida → redirigir al login
        return redirect()->route('login');
    }
}
