<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class PerfilApiController extends Controller
{
    public function updateDatos(Request $request): JsonResponse
    {
        $data = $request->validate([
            'telefono'   => ['nullable', 'string', 'max:20'],
            'direccion'  => ['nullable', 'string', 'max:255'],
            'doc_numero' => ['nullable', 'string', 'max:20'],
        ]);

        $user   = $request->user();
        $perfil = $user->perfil;

        if ($perfil) {
            $perfil->update($data);
        }

        return response()->json(['message' => 'Datos actualizados correctamente.']);
    }

    public function updateFoto(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => ['required', 'image', 'max:4096'],
        ]);

        $user   = $request->user();
        $perfil = $user->perfil;

        if (! $perfil) {
            return response()->json(['message' => 'Perfil no encontrado.'], 404);
        }

        // Eliminar foto anterior
        if ($perfil->foto_perfil) {
            Storage::disk('public')->delete($perfil->foto_perfil);
        }

        $path = $request->file('foto')->store("perfiles/{$user->id}/foto", 'public');
        $perfil->update(['foto_perfil' => $path]);

        return response()->json([
            'message' => 'Foto actualizada correctamente.',
            'url'     => asset('storage/' . $path),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password'      => ['required', 'string'],
            'password'              => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual no es correcta.'],
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }
}
