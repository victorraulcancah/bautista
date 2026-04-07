<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$orphans = DB::table('matriculas')
    ->where('apertura_id', 9)
    ->whereNull('seccion_id')
    ->get();

echo "Found " . count($orphans) . " orphans.\n";

$updated = 0;
foreach ($orphans as $m) {
    // Buscar en la tabla vieja
    $old = DB::table('pre_sanmarcos.matriculas')
        ->where('id_estudiante', $m->estu_id)
        ->orderBy('matricula_id', 'desc')
        ->first();

    if ($old) {
        $old_seccion_name = $old->seccion;
        $old_nivel_id = $old->nivel_educativo;
        $old_grado_name = $old->grado;

        // Intentar encontrar la sección correspondiente en la nueva tabla
        // Primero por grado y nombre de sección
        $new_seccion = DB::table('secciones')
            ->join('grados', 'secciones.id_grado', '=', 'grados.grado_id')
            ->where('grados.nombre_grado', $old_grado_name)
            ->where('secciones.nombre', 'like', '%' . $old_seccion_name . '%')
            ->select('secciones.seccion_id')
            ->first();

        if ($new_seccion) {
            DB::table('matriculas')
                ->where('matricula_id', $m->matricula_id)
                ->update(['seccion_id' => $new_seccion->seccion_id]);
            $updated++;
        } else {
            // Fallback: buscar solo por grado si la sección no coincide
            $new_seccion = DB::table('secciones')
                ->join('grados', 'secciones.id_grado', '=', 'grados.grado_id')
                ->where('grados.nombre_grado', $old_grado_name)
                ->select('secciones.seccion_id')
                ->first();

            if ($new_seccion) {
                DB::table('matriculas')
                    ->where('matricula_id', $m->matricula_id)
                    ->update(['seccion_id' => $new_seccion->seccion_id]);
                $updated++;
            }
        }
    }
}

echo "Updated $updated students.\n";
