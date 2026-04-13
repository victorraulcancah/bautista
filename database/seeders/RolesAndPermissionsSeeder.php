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

        // ═══════════════════════════════════════════════════════════════
        // PERMISOS JERÁRQUICOS Y GRANULARES
        // ═══════════════════════════════════════════════════════════════
        
        $permissions = [
            // ─────────────────────────────────────────────────────────
            // 1. DASHBOARD
            // ─────────────────────────────────────────────────────────
            'dashboard.ver',
            'dashboard.stats.instituciones',
            'dashboard.stats.docentes',
            'dashboard.stats.estudiantes',
            'dashboard.stats.cursos',
            'dashboard.mensajes.pendientes',
            'dashboard.notificaciones',
            'dashboard.docente.resumen',
            'dashboard.estudiante.resumen',
            'dashboard.estudiante.stats',
            'dashboard.padre.resumen',
            
            // ─────────────────────────────────────────────────────────
            // 2. PERFIL
            // ─────────────────────────────────────────────────────────
            'perfil.ver',
            'perfil.editar',
            'perfil.foto',
            'credencial.ver',
            'credencial.qr',
            
            // ─────────────────────────────────────────────────────────
            // 3. INSTITUCIÓN
            // ─────────────────────────────────────────────────────────
            'institucion.ver',
            'institucion.datos.ver',
            'institucion.datos.crear',
            'institucion.datos.editar',
            'institucion.datos.eliminar',
            'institucion.galeria.ver',
            'institucion.galeria.crear',
            'institucion.galeria.editar',
            'institucion.galeria.eliminar',
            'institucion.noticias.ver',
            'institucion.noticias.crear',
            'institucion.noticias.editar',
            'institucion.noticias.eliminar',
            'institucion.noticias.comentar',
            
            // ─────────────────────────────────────────────────────────
            // 4. ACADÉMICO (Niveles, Grados, Secciones, Cursos)
            // ─────────────────────────────────────────────────────────
            'academico.ver',
            'academico.niveles.ver',
            'academico.niveles.crear',
            'academico.niveles.editar',
            'academico.niveles.eliminar',
            'academico.cursos.ver',
            'academico.cursos.crear',
            'academico.cursos.editar',
            'academico.cursos.eliminar',
            'academico.secciones.ver',
            'academico.secciones.crear',
            'academico.secciones.editar',
            'academico.secciones.eliminar',
            'academico.horarios.ver',
            'academico.horarios.editar',

            // ─────────────────────────────────────────────────────────
            // 5. PERSONAL (Docentes y Estudiantes)
            // ─────────────────────────────────────────────────────────
            'personal.ver',
            'personal.docentes.ver',
            'personal.docentes.crear',
            'personal.docentes.editar',
            'personal.docentes.eliminar',
            'personal.docentes.cursos',
            'personal.estudiantes.ver',
            'personal.estudiantes.crear',
            'personal.estudiantes.editar',
            'personal.estudiantes.eliminar',
            'personal.estudiantes.contactos',
            'personal.estudiantes.fotocheck',
            
            // ─────────────────────────────────────────────────────────
            // 6. MATRÍCULAS
            // ─────────────────────────────────────────────────────────
            'matriculas.ver',
            'matriculas.aperturas.ver',
            'matriculas.aperturas.crear',
            'matriculas.aperturas.editar',
            'matriculas.aperturas.eliminar',
            'matriculas.gestion.ver',
            'matriculas.gestion.crear',
            'matriculas.gestion.editar',
            'matriculas.gestion.eliminar',
            
            // ─────────────────────────────────────────────────────────
            // 7. ASISTENCIA
            // ─────────────────────────────────────────────────────────
            'asistencia.ver',
            'asistencia.reportes.ver',
            'asistencia.reportes.exportar',
            'asistencia.scanner.ver',
            'asistencia.marcar.manual',
            
            // ─────────────────────────────────────────────────────────
            // 8. ADMINISTRATIVO (Pagos, Comunicados)
            // ─────────────────────────────────────────────────────────
            'admin.ver',
            'admin.pagos.ver',
            'admin.pagos.crear',
            'admin.pagos.editar',
            'admin.pagos.eliminar',
            'admin.pagos.vouchers',
            'admin.pagos.reportes',
            'admin.comunicados.ver',
            'admin.comunicados.crear',
            'admin.comunicados.editar',
            'admin.comunicados.eliminar',
            
            // ─────────────────────────────────────────────────────────
            // 9. RECURSOS (Biblioteca, Mensajería)
            // ─────────────────────────────────────────────────────────
            'recursos.ver',
            'recursos.biblioteca.ver',
            'recursos.biblioteca.carpetas',
            'recursos.biblioteca.archivos',
            'recursos.mensajeria.ver',
            'recursos.mensajeria.enviar',
            'recursos.mensajeria.grupos',
            
            // ─────────────────────────────────────────────────────────
            // 10. SEGURIDAD Y CONFIGURACIÓN
            // ─────────────────────────────────────────────────────────
            'seguridad.ver',
            'seguridad.usuarios.ver',
            'seguridad.usuarios.crear',
            'seguridad.usuarios.editar',
            'seguridad.usuarios.eliminar',
            'seguridad.roles.ver',
            'seguridad.roles.crear',
            'seguridad.roles.editar',
            'seguridad.roles.eliminar',
            'seguridad.fotochecks.diseno',

            // ─────────────────────────────────────────────────────────
            // 11. PORTALES (Específicos para Roles)
            // ─────────────────────────────────────────────────────────
            'portal.docente.ver',
            'portal.docente.cursos',
            'portal.docente.alumnos',
            'portal.docente.calificar',
            'portal.docente.asistencia',
            'portal.estudiante.ver',
            'portal.estudiante.cursos',
            'portal.estudiante.notas',
            'portal.estudiante.asistencia',
            'portal.estudiante.horario',
            'portal.estudiante.puzzles',
            'portal.padre.ver',
            'portal.padre.hijos',
            'portal.padre.pagos',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // ─────────────────────────────────────────────────────────────
        // ASIGNACIÓN DE ROLES
        // ─────────────────────────────────────────────────────────────
        
        // ADMINISTRADOR
        $admin = Role::findOrCreate('administrador', 'web');
        $admin->syncPermissions(Permission::all());

        // USUARIO BASE
        $usuario = Role::findOrCreate('usuario', 'web');
        $usuario->syncPermissions(['dashboard.ver', 'perfil.ver', 'perfil.editar']);

        // DOCENTE
        $docente = Role::findOrCreate('docente', 'web');
        $docente->syncPermissions([
            'dashboard.ver', 'dashboard.docente.resumen',
            'perfil.ver', 'perfil.editar', 'credencial.ver',
            'institucion.ver', 'institucion.datos.ver', 'institucion.galeria.ver', 'institucion.noticias.ver',
            'portal.docente.ver', 'portal.docente.cursos', 'portal.docente.alumnos', 'portal.docente.calificar', 'portal.docente.asistencia',
            'admin.comunicados.ver',
            'recursos.biblioteca.ver', 'recursos.mensajeria.ver'
        ]);

        // ESTUDIANTE
        $estudiante = Role::findOrCreate('estudiante', 'web');
        $estudiante->syncPermissions([
            'dashboard.ver', 'dashboard.estudiante.resumen', 'dashboard.estudiante.stats',
            'perfil.ver', 'perfil.editar', 'credencial.ver',
            'portal.estudiante.ver', 'portal.estudiante.cursos', 'portal.estudiante.notas', 'portal.estudiante.asistencia', 'portal.estudiante.horario', 'portal.estudiante.puzzles',
            'admin.comunicados.ver',
            'recursos.biblioteca.ver', 'recursos.mensajeria.ver'
        ]);

        // PADRE
        $padre = Role::findOrCreate('padre_familia', 'web');
        $padre->syncPermissions([
            'dashboard.ver', 'dashboard.padre.resumen',
            'perfil.ver', 'perfil.editar',
            'institucion.ver', 'institucion.datos.ver',
            'portal.padre.ver', 'portal.padre.hijos', 'portal.padre.pagos',
            'admin.comunicados.ver'
        ]);

        // Sincronizar Usuarios Existentes
        $this->command->info('Sincronizando roles...');
        $users = User::whereNotNull('rol_id')->get();
        foreach ($users as $user) {
            $rolName = DB::table('roles')->where('id', $user->rol_id)->value('name');
            if ($rolName) $user->assignRole($rolName);
        }

        $this->command->info('¡Sistema jerárquico global sincronizado!');
    }
}
