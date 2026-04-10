<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Limpieza TOTAL para evitar basura de versiones anteriores
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('permissions')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Definir Permisos (EN ESPAÑOL)
        $permissions = [
            // Dashboard (Widgets Modulares)
            'dashboard.ver',                    // Acceso base al dashboard
            'dashboard.periodo.global',         // Cuadros de totales (Admin/Auxiliar)
            'dashboard.mensajes.recientes',     // Consultas y mensajes pendientes
            'dashboard.accesos.admin',          // Botones de accesos rápidos
            'dashboard.cursos.asignados',       // Tabla de cursos asignados (Docente)
            'dashboard.resumen.academico',      // Resumen de notas/asistencia (Estudiante)
            'dashboard.resumen.familiar',       // Resumen de hijos (Padre)
            
            // Institución
            'institucion.ver',
            'institucion.gestionar',
            
            // Académico
            'niveles.ver',
            'niveles.gestionar',
            'cursos.ver',
            'cursos.gestionar',
            'secciones.ver',
            'secciones.gestionar',
            
            // Usuarios / Personal
            'docentes.ver',
            'docentes.gestionar',
            'estudiantes.ver',
            'estudiantes.gestionar',
            'usuarios.ver',
            'usuarios.gestionar',
            
            // Procesos
            'matriculas.ver',
            'matriculas.gestionar',
            'asistencia.ver',
            'asistencia.gestionar',
            'asistencia.escanear',
            'pagos.ver',
            'pagos.gestionar',
            
            // Recursos
            'biblioteca.ver',
            'biblioteca.gestionar',
            'comunicados.ver',
            'comunicados.gestionar',
            'mensajeria.ver',

            // Seguridad y Roles
            'roles.gestionar',
            'seguridad.ver',

            // Permisos de Portal/Acciones específicas (EN ESPAÑOL)
            'portal.alumno.qr',
            'portal.alumno.asistencia',
            'portal.docente.alumnos',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // 2. Definir Roles y Asignar Permisos
        
        // Administrador: Todo
        $admin = Role::findOrCreate('administrador', 'web');
        $admin->syncPermissions(Permission::all());

        $usuario = Role::findOrCreate('usuario', 'web');
        $usuario->syncPermissions(Permission::all());

        // Docente
        $docente = Role::findOrCreate('docente', 'web');
        $docente->syncPermissions([
            'dashboard.ver',
            'dashboard.cursos.asignados',
            'dashboard.mensajes.recientes',
            'portal.docente.alumnos',
            'cursos.ver',
            'estudiantes.ver',
            'asistencia.ver',
            'asistencia.gestionar',
            'biblioteca.ver',
            'comunicados.ver',
            'mensajeria.ver',
        ]);

        // Estudiante
        $estudiante = Role::findOrCreate('estudiante', 'web');
        $estudiante->syncPermissions([
            'dashboard.ver',
            'dashboard.resumen.academico',
            'dashboard.mensajes.recientes',
            'portal.alumno.qr',
            'portal.alumno.asistencia',
            'cursos.ver',
            'asistencia.ver',
            'biblioteca.ver',
            'comunicados.ver',
        ]);

        // Padre de Familia / Apoderado
        $padrePermissions = [
            'dashboard.ver',
            'dashboard.resumen.familiar',
            'dashboard.mensajes.recientes',
            'comunicados.ver'
        ];

        Role::findOrCreate('padre_familia', 'web')->syncPermissions($padrePermissions);
        Role::findOrCreate('madre_familia', 'web')->syncPermissions($padrePermissions);
        Role::findOrCreate('apoderado', 'web')->syncPermissions($padrePermissions);

        // Psicólogo
        $psicologo = Role::findOrCreate('psicologo', 'web');
        $psicologo->syncPermissions([
            'dashboard.ver',
            'dashboard.periodo.global',
            'dashboard.mensajes.recientes',
            'estudiantes.ver',
            'comunicados.ver',
            'mensajeria.ver',
        ]);

        // 3. Sincronizar Usuarios Existentes
        $this->command->info('Sincronizando roles de usuarios existentes...');
        
        $users = User::whereNotNull('rol_id')->get();
        foreach ($users as $user) {
            $rolName = DB::table('roles')->where('id', $user->rol_id)->value('name');
            if ($rolName) {
                $user->assignRole($rolName);
            }
        }

        $this->command->info('¡Roles y permisos en ESPAÑOL sincronizados correctamente!');
    }
}
