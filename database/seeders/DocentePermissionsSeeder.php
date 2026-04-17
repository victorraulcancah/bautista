<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seeder de permisos para el rol: docente
 * Total: 18 permisos
 *
 * Uso: php artisan db:seed --class=DocentePermissionsSeeder
 */
class DocentePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Dashboard
            'dashboard.ver',
            'dashboard.notificaciones',
            'dashboard.docente.resumen',
            'dashboard.docente.cursos',

            // Perfil
            'perfil.ver',
            'perfil.editar',
            'credencial.ver',

            // Horarios
            'horarios.ver',
            'horarios.clases.ver',

            // Administrativo
            'admin.comunicados.ver',

            // Recursos
            'recursos.biblioteca.ver',
            'recursos.mensajeria.ver',
            'recursos.mensajeria.enviar',

            // Portal Docente
            'portal.docente.ver',
            'portal.docente.cursos',
            'portal.docente.alumnos',
            'portal.docente.calificar',
            'portal.docente.asistencia',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }

        $role = Role::findOrCreate('docente', 'web');
        $role->syncPermissions($permissions);

        $this->command->info('Docente: ' . count($permissions) . ' permisos aplicados.');
    }
}
