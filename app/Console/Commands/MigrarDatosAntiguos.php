<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MigrarDatosAntiguos extends Command
{
    protected $signature   = 'migrar:datos-antiguos {--tabla= : Migrar solo una tabla específica}';
    protected $description = 'Migra datos desde edu_bautista (antigua) a edu_bautista2 (nueva)';

    public function handle(): void
    {
        $tabla = $this->option('tabla');

        $tablas = $tabla ? [$tabla] : [
            'instituciones',
            'docentes',
            'estudiantes',
            'cursos',
        ];

        foreach ($tablas as $t) {
            $metodo = 'migrar' . ucfirst($t);
            if (method_exists($this, $metodo)) {
                $this->info("Migrando: {$t}...");
                $this->$metodo();
                $this->info("✓ {$t} completado.");
            } else {
                $this->warn("No hay método para: {$t}");
            }
        }

        $this->info('Migración completa.');
    }

    // -------------------------------------------------------------------------
    // Institución
    // -------------------------------------------------------------------------
    private function migrarinstituciones(): void
    {
        $antigua = DB::connection('mysql_old')
            ->table('institucion_educativa')
            ->get();

        foreach ($antigua as $row) {
            DB::table('institucion_educativa')->updateOrInsert(
                ['insti_id' => $row->insti_id],
                [
                    'insti_nombre'    => $row->insti_nombre,
                    'insti_direccion' => $row->insti_direccion ?? null,
                    'insti_telefono'  => $row->insti_telefono ?? null,
                    'insti_estado'    => $row->insti_estado  ?? 1,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]
            );
        }
    }

    // -------------------------------------------------------------------------
    // Docentes
    // -------------------------------------------------------------------------
    private function migrardocentes(): void
    {
        $antigua = DB::connection('mysql_old')
            ->table('docente')   // ajusta el nombre real de la tabla
            ->get();

        foreach ($antigua as $row) {
            DB::table('users')->updateOrInsert(
                ['username' => $row->doc_dni ?? $row->doc_usuario],
                [
                    'name'       => trim(($row->doc_nombre ?? '') . ' ' . ($row->doc_apellido ?? '')),
                    'username'   => $row->doc_dni ?? $row->doc_usuario,
                    'email'      => $row->doc_email ?? ($row->doc_dni . '@iepbautista.edu.pe'),
                    'password'   => Hash::make($row->doc_dni ?? 'bautista2050'),
                    'insti_id'   => $row->insti_id ?? 1,
                    'estado'     => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    // -------------------------------------------------------------------------
    // Estudiantes
    // -------------------------------------------------------------------------
    private function migrarestudiantes(): void
    {
        $antigua = DB::connection('mysql_old')
            ->table('estudiantes')
            ->get();

        foreach ($antigua as $row) {
            DB::table('users')->updateOrInsert(
                ['username' => $row->estu_dni],
                [
                    'name'       => trim($row->estu_nombre . ' ' . $row->estu_apellido),
                    'username'   => $row->estu_dni,
                    'email'      => $row->estu_dni . '@iepbautista.edu.pe',
                    'password'   => Hash::make($row->estu_dni),
                    'insti_id'   => $row->insti_id ?? 1,
                    'estado'     => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    // -------------------------------------------------------------------------
    // Cursos
    // -------------------------------------------------------------------------
    private function migrarcursos(): void
    {
        $antigua = DB::connection('mysql_old')
            ->table('cursos')
            ->get();

        foreach ($antigua as $row) {
            DB::table('cursos')->updateOrInsert(
                ['id' => $row->cur_id ?? $row->id],
                [
                    'nombre'     => $row->cur_nombre ?? $row->nombre,
                    'insti_id'   => $row->insti_id ?? 1,
                    'estado'     => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
