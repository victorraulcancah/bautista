<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seeder de permisos para el rol: estudiante
 * Total: 18 permisos
 *
 * Uso: php artisan db:seed --class=EstudiantePermissionsSeeder
 */
class EstudiantePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Dashboard
            'dashboard.ver',
            'dashboard.estudiante.resumen',
            'dashboard.estudiante.stats',

            // Perfil
            'perfil.ver',
            'perfil.editar',
            'credencial.ver',

            // Institución (solo portada pública)
            'institucion.noticias.portada',

            // Horarios
            'horarios.ver',
            'horarios.clases.ver',

            // Administrativo
            'admin.comunicados.ver',

            // Recursos
            'recursos.biblioteca.ver',
            'recursos.mensajeria.ver',
            'recursos.mensajeria.enviar',

            // Portal Estudiante
            'portal.estudiante.ver',
            'portal.estudiante.cursos',
            'portal.estudiante.notas',
            'portal.estudiante.asistencia',
            'portal.estudiante.puzzles',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }

        $role = Role::findOrCreate('estudiante', 'web');
        $role->syncPermissions($permissions);

        $this->command->info('Estudiante: ' . count($permissions) . ' permisos aplicados.');
    }
}
