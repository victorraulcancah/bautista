<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$orphans = DB::table('matriculas')
    ->where('apertura_id', 9)
    ->whereNull('seccion_id')
    ->get();

echo "Resolving " . count($orphans) . " orphans by doc_numero...\n";

foreach ($orphans as $m) {
    // Get student doc_numero from new profile
    $estu = DB::table('estudiantes')->where('estu_id', $m->estu_id)->first();
    if ($estu) {
        $perfil = DB::table('perfiles')->where('perfil_id', $estu->perfil_id)->first();
        if ($perfil && $perfil->doc_numero) {
            $doc = $perfil->doc_numero;

            // Search in OLD profile table
            // Based on previous search, I'll try to find the table that has doc_numero in pre_sanmarcos
            $old_perfil = DB::table('pre_sanmarcos.perfiles')->where('doc_numero', $doc)->first();

            if ($old_perfil) {
                // Find old matricula for this profile
                $old_mat = DB::table('pre_sanmarcos.matriculas')
                    ->where('id_contacto', $old_perfil->perfil_id)
                    ->orderBy('matricula_id', 'desc')
                    ->first();

                if ($old_mat) {
                    $old_grado = $old_mat->grado;

                    // Map to new grade
                    $new_grado = DB::table('grados')
                        ->where('nombre_grado', 'like', '%' . $old_grado . '%')
                        ->first();

                    if ($new_grado) {
                        $new_seccion = DB::table('secciones')
                            ->where('id_grado', $new_grado->grado_id)
                            ->first();

                        if ($new_seccion) {
                            DB::table('matriculas')
                                ->where('matricula_id', $m->matricula_id)
                                ->update(['seccion_id' => $new_seccion->seccion_id]);
                            echo "Mapped: " . $perfil->primer_nombre . " -> " . $new_grado->nombre_grado . "\n";
                        }
                    }
                }
            }
        }
    }
}
echo "Done.\n";
