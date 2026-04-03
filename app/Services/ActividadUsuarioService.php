<?php

namespace App\Services;

use App\Models\ActividadUsuario;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Servicio de auditoría de acciones de usuario.
 * Se usa directamente (sin interface) como singleton registrado en AppServiceProvider.
 * Falla silenciosamente para no interrumpir el flujo principal si el log falla.
 */
class ActividadUsuarioService
{
    public function registrar(
        string $accion,
        string $entidad,
        ?int   $entidadId,
        string $descripcion,
        ?int   $userId = null,
    ): void {
        try {
            $uid = $userId ?? Auth::id();
            if (! $uid) return;

            ActividadUsuario::create([
                'user_id'    => $uid,
                'accion'     => $accion,
                'entidad'    => $entidad,
                'entidad_id' => $entidadId,
                'descripcion'=> $descripcion,
                'ip'         => Request::ip(),
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Fallo silencioso: el log de auditoría no debe romper el flujo principal
        }
    }

    public function historialDeUsuario(int $userId, int $limit = 50): Collection
    {
        return ActividadUsuario::where('user_id', $userId)
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }
}
