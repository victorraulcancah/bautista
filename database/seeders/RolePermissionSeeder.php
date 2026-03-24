<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Permisos ---
        $permisos = [
            // Usuarios
            'users.view', 'users.create', 'users.edit', 'users.delete',
            // Instituciones
            'instituciones.view', 'instituciones.edit',
            // Cursos
            'cursos.view', 'cursos.create', 'cursos.edit', 'cursos.delete',
            // Estudiantes
            'estudiantes.view', 'estudiantes.create', 'estudiantes.edit', 'estudiantes.delete',
            // Docentes
            'docentes.view', 'docentes.create', 'docentes.edit', 'docentes.delete',
            // Matrículas
            'matriculas.view', 'matriculas.create', 'matriculas.edit', 'matriculas.delete',
            // Notas / Calificaciones
            'notas.view', 'notas.create', 'notas.edit',
            // Asistencia
            'asistencia.view', 'asistencia.create', 'asistencia.edit',
            // Actividades
            'actividades.view', 'actividades.create', 'actividades.edit', 'actividades.delete',
            // Materiales
            'materiales.view', 'materiales.upload',
            // Reportes
            'reportes.view', 'reportes.create',
            // Psicología
            'psicologia.view', 'psicologia.create', 'psicologia.edit',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        // --- Roles y asignación de permisos ---

        // ADMINISTRADOR — acceso total
        $admin = Role::firstOrCreate(['name' => 'administrador']);
        $admin->givePermissionTo(Permission::all());

        // DOCENTE
        $docente = Role::firstOrCreate(['name' => 'docente']);
        $docente->givePermissionTo([
            'cursos.view', 'cursos.create', 'cursos.edit',
            'estudiantes.view',
            'notas.view', 'notas.create', 'notas.edit',
            'asistencia.view', 'asistencia.create', 'asistencia.edit',
            'actividades.view', 'actividades.create', 'actividades.edit', 'actividades.delete',
            'materiales.view', 'materiales.upload',
            'reportes.view',
        ]);

        // ESTUDIANTE
        $estudiante = Role::firstOrCreate(['name' => 'estudiante']);
        $estudiante->givePermissionTo([
            'cursos.view',
            'notas.view',
            'asistencia.view',
            'actividades.view',
            'materiales.view',
            'reportes.view',
        ]);

        // PADRE DE FAMILIA, MADRE DE FAMILIA, APODERADO — mismos permisos base
        $permisosApoderado = ['notas.view', 'asistencia.view', 'reportes.view'];

        $padres = ['padre_familia', 'madre_familia', 'apoderado'];
        foreach ($padres as $rolNombre) {
            $rol = Role::firstOrCreate(['name' => $rolNombre]);
            $rol->givePermissionTo($permisosApoderado);
        }

        // PSICÓLOGO
        $psicologo = Role::firstOrCreate(['name' => 'psicologo']);
        $psicologo->givePermissionTo([
            'estudiantes.view',
            'reportes.view', 'reportes.create',
            'psicologia.view', 'psicologia.create', 'psicologia.edit',
        ]);
    }
}
