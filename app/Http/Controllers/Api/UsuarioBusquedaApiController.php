<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsuarioBusquedaApiController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q       = $request->get('q', '');
        $instiId = $request->user()->insti_id;
        $selfId  = $request->user()->id;

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $usuarios = User::where('insti_id', $instiId)
            ->where('id', '!=', $selfId)
            ->where(function ($query) use ($q) {
                $query->where('username', 'like', "%{$q}%")
                      ->orWhereHas('perfil', fn ($p) => $p
                          ->where('primer_nombre', 'like', "%{$q}%")
                          ->orWhere('apellido_paterno', 'like', "%{$q}%")
                      );
            })
            ->with('perfil:perfil_id,user_id,primer_nombre,apellido_paterno')
            ->limit(10)
            ->get();

        return response()->json($usuarios->map(fn ($u) => [
            'id'     => $u->id,
            'nombre' => $u->perfil
                ? trim("{$u->perfil->primer_nombre} {$u->perfil->apellido_paterno}")
                : $u->username,
            'username' => $u->username,
        ]));
    }
}
