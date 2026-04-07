<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$orphans = DB::table('matriculas')
    ->join('estudiantes', 'matriculas.estu_id', '=', 'estudiantes.estu_id')
    ->join('perfiles', 'estudiantes.perfil_id', '=', 'perfiles.perfil_id')
    ->where('matriculas.apertura_id', 9)
    ->whereNull('matriculas.seccion_id')
    ->select('matriculas.matricula_id', 'perfiles.primer_nombre', 'perfiles.apellido_paterno', 'perfiles.apellido_materno')
    ->get();

echo "Repairing " . count($orphans) . " orphans...\n";

foreach ($orphans as $m) {
    $fullName = trim($m->primer_nombre . ' ' . $m->apellido_paterno);
    
    // Look for ANY match in old perfiles
    $old_p = DB::table('pre_sanmarcos.perfiles')
        ->where('primer_nombre', 'like', '%' . $m->primer_nombre . '%')
        ->where('apellido_paterno', 'like', '%' . $m->apellido_paterno . '%')
        ->first();

    if ($old_p) {
        // Find their level in old matriculas
        $old_m = DB::table('pre_sanmarcos.matriculas')
            ->where('id_contacto', $old_p->perfil_id)
            ->orderBy('matricula_id', 'desc')
            ->first();

        if ($old_m) {
            $old_grado_name = $old_m->grado;
            
            // Map to new grade
            $new_grado = DB::table('grados')
                ->where('nombre_grado', 'like', '%' . $old_grado_name . '%')
                ->first();

            if ($new_grado) {
                $new_seccion = DB::table('secciones')
                    ->where('id_grado', $new_grado->grado_id)
                    ->first();

                if ($new_seccion) {
                    DB::table('matriculas')
                        ->where('matricula_id', $m->matricula_id)
                        ->update(['seccion_id' => $new_seccion->seccion_id]);
                    echo "Mapped " . $fullName . " to " . $new_grado->nombre_grado . "\n";
                }
            }
        }
    }
}
echo "Finished.\n";
