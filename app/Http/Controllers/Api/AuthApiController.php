<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\UserInactiveException;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\LoginHistory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthApiController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Las credenciales son incorrectas.'],
            ]);
        }

        if (! $user->isActivo()) {
            throw new UserInactiveException();
        }

        LoginHistory::create([
            'user_id'    => $user->id,
            'ip_address' => $request->ip(),
            'device'     => $request->device_name,
            'tipo'       => '1',
        ]);

        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        LoginHistory::create([
            'user_id'    => $request->user()->id,
            'ip_address' => $request->ip(),
            'device'     => $request->header('User-Agent', 'unknown'),
            'tipo'       => '0',
        ]);

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('perfil', 'institucion'));
    }
}
