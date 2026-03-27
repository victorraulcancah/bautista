<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class FixMigratedData extends Command
{
    protected $signature   = 'migration:fix
                                {--passwords : Arregla el prefijo $2b$ → $2y$ en contraseñas}
                                {--roles     : Crea y asigna roles basado en el campo "tipo" del legacy}
                                {--all       : Ejecuta ambas correcciones}';

    protected $description = 'Corrige datos post-migración: prefijo bcrypt y asignación de roles';

    // Mapa: valor del campo "tipo" en la tabla users (legacy) → nombre del rol en Spatie
    private const TIPO_MAP = [
        'admin'     => 'admin',
        'docente'   => 'docente',
        'padre'     => 'padre',
        'estudiante'=> 'estudiante',
        'apoderado' => 'padre',   // alias
    ];

    public function handle(): int
    {
        $runPasswords = $this->option('all') || $this->option('passwords');
        $runRoles     = $this->option('all') || $this->option('roles');

        if (!$runPasswords && !$runRoles) {
            $this->warn('Especifica --passwords, --roles o --all');
            $this->line('  php artisan migration:fix --all');
            return self::FAILURE;
        }

        if ($runPasswords) {
            $this->fixPasswords();
        }

        if ($runRoles) {
            $this->fixRoles();
        }

        return self::SUCCESS;
    }

    // ─── Paso 1: Arregla prefijo $2b$ → $2y$ ──────────────────────────────────
    private function fixPasswords(): void
    {
        $this->info('');
        $this->info('━━━  FIX PASSWORDS ($2b$ → $2y$)  ━━━');

        $total = DB::table('users')
            ->where('password', 'like', '$2b$%')
            ->count();

        if ($total === 0) {
            $this->line('  ✓  Ninguna contraseña requiere corrección.');
            return;
        }

        $this->line("  Encontradas {$total} contraseñas con prefijo \$2b\$...");

        // Raw SQL REPLACE — no pasa por el cast 'hashed' de Eloquent
        $affected = DB::statement(
            "UPDATE users SET password = REPLACE(password, '\$2b\$', '\$2y\$') WHERE password LIKE '\$2b\$%'"
        );

        $fixed = DB::table('users')
            ->where('password', 'like', '$2y$%')
            ->count();

        $this->info("  ✓  {$total} contraseñas corregidas a prefijo \$2y\$");
        $this->line("     Total con \$2y\$: {$fixed}");
    }

    // ─── Paso 2: Crea roles y los asigna según campo "tipo" ───────────────────
    private function fixRoles(): void
    {
        $this->info('');
        $this->info('━━━  FIX ROLES (Spatie Permission)  ━━━');

        // 1. Crear roles si no existen
        $rolesCreados = 0;
        foreach (array_unique(self::TIPO_MAP) as $rolNombre) {
            if (!Role::where('name', $rolNombre)->exists()) {
                Role::create(['name' => $rolNombre, 'guard_name' => 'web']);
                $this->line("  + Rol creado: {$rolNombre}");
                $rolesCreados++;
            }
        }

        if ($rolesCreados === 0) {
            $this->line('  ℹ  Todos los roles ya existen.');
        }

        // 2. Asignar roles según el campo "tipo" de cada usuario
        // En la migración, el tipo se guardó en "name" o en Perfil.
        // Buscamos por el campo tipo de la tabla users del legacy sistema:
        // El campo usado en la migración es la columna "tipo" (si existe) o lo inferimos.
        $tieneColTipo = in_array('tipo', DB::getSchemaBuilder()->getColumnListing('users'));

        if (!$tieneColTipo) {
            $this->warn('  ⚠  La tabla users no tiene columna "tipo". Asignando roles por defecto...');
            $this->assignRolesByHeuristic();
            return;
        }

        $users = DB::table('users')->whereNotNull('tipo')->get(['id', 'username', 'tipo']);
        $asignados = 0;

        foreach ($users as $u) {
            $tipo     = strtolower(trim($u->tipo));
            $rolNombre = self::TIPO_MAP[$tipo] ?? null;

            if (!$rolNombre) {
                $this->warn("  ?  user={$u->username}  tipo={$tipo} → sin mapeo, saltando");
                continue;
            }

            DB::table('model_has_roles')
                ->where('model_id', $u->id)
                ->where('model_type', 'App\Models\User')
                ->delete();

            $rol = Role::where('name', $rolNombre)->first();
            DB::table('model_has_roles')->insert([
                'role_id'    => $rol->id,
                'model_type' => 'App\Models\User',
                'model_id'   => $u->id,
            ]);

            $this->line("  ✓  {$u->username} → {$rolNombre}");
            $asignados++;
        }

        $this->info("  ✓  {$asignados} usuarios con rol asignado.");
    }

    // Heurística si no hay columna tipo: username numérico = padre, texto = admin
    private function assignRolesByHeuristic(): void
    {
        $this->line('  Aplicando heurística: username numérico → padre, texto → admin...');

        $adminRol = Role::firstOrCreate(['name' => 'admin',  'guard_name' => 'web']);
        $padreRol = Role::firstOrCreate(['name' => 'padre',  'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'docente', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'estudiante', 'guard_name' => 'web']);

        $asignados = 0;

        DB::table('users')->get(['id', 'username'])->each(function ($u) use ($adminRol, $padreRol, &$asignados) {
            $yaAsignado = DB::table('model_has_roles')
                ->where('model_id', $u->id)
                ->where('model_type', 'App\Models\User')
                ->exists();

            if ($yaAsignado) {
                return;
            }

            $rolId = is_numeric($u->username) ? $padreRol->id : $adminRol->id;
            $label = is_numeric($u->username) ? 'padre' : 'admin';

            DB::table('model_has_roles')->insert([
                'role_id'    => $rolId,
                'model_type' => 'App\Models\User',
                'model_id'   => $u->id,
            ]);

            $this->line("  ~  {$u->username} → {$label} (heurística)");
            $asignados++;
        });

        $this->info("  ✓  {$asignados} roles asignados por heurística.");
    }
}
