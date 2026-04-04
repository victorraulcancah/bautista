<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Laravel\Sanctum\PersonalAccessToken;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name'        => config('app.name'),
            'auth'        => fn () => [
                'user' => $this->resolveUser($request),
            ],
            'branding'    => function () use ($request) {
                $user = $this->resolveUser($request);
                $institucion = $user ? $user->institucion : \App\Models\InstitucionEducativa::first();
                
                if (!$institucion) return null;

                return [
                    'logo' => $institucion->insti_logo ? asset('storage/' . $institucion->insti_logo) : null,
                    'background' => $institucion->insti_fondo_login ? asset('storage/' . $institucion->insti_fondo_login) : null,
                ];
            },
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Intenta resolver el usuario autenticado:
     * 1) Desde la sesión PHP (Fortify / web auth)
     * 2) Desde la cookie auth_token (Sanctum Bearer via cookie)
     */
    private function resolveUser(Request $request): mixed
    {
        // 1. Sesión estándar
        if ($request->user()) {
            return $request->user()->load('perfil', 'rol');
        }

        // 2. Token desde cookie auth_token
        $tokenCookie = $request->cookie('auth_token');
        if ($tokenCookie) {
            $token = PersonalAccessToken::findToken($tokenCookie);
            if ($token && $token->tokenable) {
                return $token->tokenable->load('perfil', 'rol');
            }
        }

        return null;
    }
}
