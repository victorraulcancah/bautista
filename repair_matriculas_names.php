<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$orphans = DB::table('matriculas')
    ->where('apertura_id', 9)
    ->whereNull('seccion_id')
    ->get();

echo "Resolving " . count($orphans) . " orphans...\n";

foreach ($orphans as $m) {
    // Get student name from new profile
    $perfil = DB::table('perfiles')->where('perfil_id', $m->estu_id)->first();
    if (!$perfil) {
        // Fallback: search in estudiantes then perfiles
        $estu = DB::table('estudiantes')->where('estu_id', $m->estu_id)->first();
        if ($estu) {
            $perfil = DB::table('perfiles')->where('perfil_id', $estu->perfil_id)->first();
        }
    }

    if ($perfil) {
        $first_name = $perfil->primer_nombre;
        $last_name = $perfil->apellido_paterno;

        // Search in OLD table pre_sanmarcos.matriculas joined with pre_sanmarcos.perfiles (or similar)
        // I'll try to find any record that matches the name in ANY old matricula
        $old = DB::table('pre_sanmarcos.matriculas')
            ->join('pre_sanmarcos.perfiles', 'pre_sanmarcos.matriculas.id_contacto', '=', 'pre_sanmarcos.perfiles.perfil_id')
            ->where('pre_sanmarcos.perfiles.primer_nombre', 'like', '%' . $first_name . '%')
            ->where('pre_sanmarcos.perfiles.apellido_paterno', 'like', '%' . $last_name . '%')
            ->select('pre_sanmarcos.matriculas.*')
            ->orderBy('pre_sanmarcos.matriculas.fehca_matricula', 'desc')
            ->first();

        if ($old) {
            $old_grado = $old->grado;
            $old_seccion = $old->seccion;

            // Map old grade name to new grade ID
            $new_grado = DB::table('grados')
                ->where('nombre_grado', 'like', '%' . $old_grado . '%')
                ->first();

            if ($new_grado) {
                // Find a section for this grade in the new table
                $new_seccion = DB::table('secciones')
                    ->where('id_grado', $new_grado->grado_id)
                    ->first();

                if ($new_seccion) {
                    DB::table('matriculas')
                        ->where('matricula_id', $m->matricula_id)
                        ->update(['seccion_id' => $new_seccion->seccion_id]);
                    echo "Mapped: " . $first_name . " " . $last_name . " -> " . $new_grado->nombre_grado . "\n";
                }
            }
        }
    }
}
echo "Done.\n";
