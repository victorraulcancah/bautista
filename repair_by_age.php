<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$orphans = DB::table('matriculas')
    ->join('estudiantes', 'matriculas.estu_id', '=', 'estudiantes.estu_id')
    ->join('perfiles', 'estudiantes.perfil_id', '=', 'perfiles.perfil_id')
    ->where('matriculas.apertura_id', 9)
    ->whereNull('matriculas.seccion_id')
    ->select('matriculas.matricula_id', 'perfiles.fecha_nacimiento')
    ->get();

echo "Analyzing " . count($orphans) . " orphans...\n";

$updated = 0;
foreach ($orphans as $m) {
    if (!$m->fecha_nacimiento) continue;

    $birthDate = Carbon::parse($m->fecha_nacimiento);
    $age = $birthDate->diffInYears(Carbon::create(2026, 4, 7)); // Use the system date from the task

    $level_id = null;
    if ($age >= 2 && $age <= 5) {
        $level_id = 32; // INICIAL
    } elseif ($age >= 6 && $age <= 11) {
        $level_id = 33; // PRIMARIA
    } elseif ($age >= 12 && $age <= 20) {
        $level_id = 34; // SECUNDARIA
    }

    if ($level_id) {
        // Find a section for this level. We'll pick the first one available for that level.
        $section = DB::table('secciones')
            ->join('grados', 'secciones.id_grado', '=', 'grados.grado_id')
            ->where('grados.nivel_id', $level_id)
            ->select('secciones.seccion_id', 'grados.nombre_grado', 'secciones.nombre as seccion_nombre')
            ->first();

        if ($section) {
            DB::table('matriculas')
                ->where('matricula_id', $m->matricula_id)
                ->update(['seccion_id' => $section->seccion_id]);
            $updated++;
            // echo "Assigned ID {$m->matricula_id} (age {$age}) to level {$level_id} ({$section->nombre_grado} {$section->seccion_nombre})\n";
        }
    }
}
echo "Updated $updated students.\n";
echo "Done.\n";
