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

        // 1. Definir Permisos (CRUD COMPLETO EN ESPAÑOL)
        $permissions = [
            // Dashboard (Widgets Modulares)
            'dashboard.ver',
            'dashboard.periodo.global',
            'dashboard.mensajes.recientes',
            'dashboard.accesos.admin',
            'dashboard.cursos.asignados',
            'dashboard.resumen.academico',
            'dashboard.resumen.familiar',
            
            // Institución
            'institucion.ver',
            'institucion.crear',
            'institucion.editar',
            'institucion.borrar',
            
            // Niveles Académicos
            'niveles.ver',
            'niveles.crear',
            'niveles.editar',
            'niveles.borrar',

            // Cursos
            'cursos.ver',
            'cursos.crear',
            'cursos.editar',
            'cursos.borrar',

            // Secciones
            'secciones.ver',
            'secciones.crear',
            'secciones.editar',
            'secciones.borrar',
            
            // Docentes
            'docentes.ver',
            'docentes.crear',
            'docentes.editar',
            'docentes.borrar',

            // Estudiantes
            'estudiantes.ver',
            'estudiantes.crear',
            'estudiantes.editar',
            'estudiantes.borrar',

            // Usuarios de Sistema
            'usuarios.ver',
            'usuarios.crear',
            'usuarios.editar',
            'usuarios.borrar',
            
            // Matrículas
            'matriculas.ver',
            'matriculas.crear',
            'matriculas.editar',
            'matriculas.borrar',

            // Asistencia
            'asistencia.ver',
            'asistencia.crear',
            'asistencia.editar',
            'asistencia.borrar',
            'asistencia.escanear',
            
            // Pagos / Tesorería
            'pagos.ver',
            'pagos.crear',
            'pagos.editar',
            'pagos.borrar',
            
            // Biblioteca
            'biblioteca.ver',
            'biblioteca.crear',
            'biblioteca.editar',
            'biblioteca.borrar',

            // Comunicados
            'comunicados.ver',
            'comunicados.crear',
            'comunicados.editar',
            'comunicados.borrar',

            // Mensajería
            'mensajeria.ver',

            // Roles y Seguridad
            'roles.ver',
            'roles.crear',
            'roles.editar',
            'roles.borrar',
            'seguridad.ver',

            // Portales Específicos
            'portal.alumno.qr',
            'portal.alumno.asistencia',
            'portal.docente.alumnos',
            'perfil.ver_credencial',
            'configuracion.fotocheck',
            'asistencia.reportes',
            'configuracion.horarios',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // 2. Definir Roles y Asignar Permisos
        
        // Administrador: Todo (Absolutamente todo el CRUD)
        $admin = Role::findOrCreate('administrador', 'web');
        $admin->syncPermissions(Permission::all());

        // Rol Usuario Estándar (Herencia de todos los permisos por ahora según pedido)
        $usuario = Role::findOrCreate('usuario', 'web');
        $usuario->syncPermissions(Permission::all());

        // Docente (Limitado a su portal y gestión básica)
        $docente = Role::findOrCreate('docente', 'web');
        $docente->syncPermissions([
            'dashboard.ver',
            'dashboard.cursos.asignados',
            'dashboard.mensajes.recientes',
            'portal.docente.alumnos',
            'cursos.ver',
            'estudiantes.ver',
            'asistencia.ver',
            'asistencia.crear',
            'asistencia.editar',
            'biblioteca.ver',
            'comunicados.ver',
            'mensajeria.ver',
            'perfil.ver_credencial',
        ]);

        // Estudiante (Solo vista personal)
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
            'perfil.ver_credencial',
        ]);

        // Padres de Familia / Apoderados
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

        $this->command->info('¡Roles y permisos CRUD en ESPAÑOL sincronizados correctamente!');
    }
}
