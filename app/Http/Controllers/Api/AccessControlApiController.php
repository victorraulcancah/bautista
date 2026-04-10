<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AccessControlApiController extends Controller
{
    /**
     * Listar todos los roles con sus permisos.
     */
    public function indexRoles(): JsonResponse
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    /**
     * Listar todos los permisos disponibles agrupados por categoría (prefijo).
     */
    public function indexPermissions(): JsonResponse
    {
        $permissions = Permission::all();
        return response()->json($permissions);
    }

    /**
     * Crear un nuevo rol y asignarle permisos.
     */
    public function storeRole(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name']
        ]);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);

        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Actualizar un rol y sus permisos.
     */
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // No permitir editar el nombre de los roles base del sistema si es necesario, 
        // pero por ahora permitiremos edición general.
        $data = $request->validate([
            'name'        => ['required', 'string', 'unique:roles,name,' . $id],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name']
        ]);

        $role->update(['name' => $data['name']]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return response()->json($role->load('permissions'));
    }

    /**
     * Eliminar un rol.
     */
    public function destroyRole(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        
        // Proteccion contra borrado de administrador
        if ($role->name === 'administrador' || $role->name === 'usuario') {
            return response()->json(['message' => 'No se pueden eliminar los roles base del sistema.'], 403);
        }

        $role->delete();

        return response()->json(null, 204);
    }
}
