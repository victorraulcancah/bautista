<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\Interfaces\AuthServiceInterface;
use Illuminate\Auth\AuthManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthApiController extends Controller
{
    public function __construct(
        private AuthServiceInterface $authService,
        private AuthManager $auth
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->username,
            $request->password,
            $request->device_name,
            $request->ip()
        );

        // Crear sesión PHP para que las navegaciones posteriores funcionen
        $this->auth->login($result['user']);

        return response()->json([
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if ($user) {
            $this->authService->logout(
                $user,
                $request->ip(),
                $request->header('User-Agent', 'unknown')
            );
        }

        // Limpiar sesión PHP
        $this->auth->logout();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('perfil', 'institucion'));
    }
}
