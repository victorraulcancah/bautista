<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Buscar docente con DNI 88000001
$docente = \App\Models\Docente::whereHas('perfil', function($q) {
    $q->where('doc_numero', '88000001');
})->with(['perfil', 'user'])->first();

if (!$docente) {
    echo "❌ Docente con DNI 88000001 NO encontrado\n";
    exit;
}

echo "✅ Docente encontrado:\n";
echo "   docente_id: {$docente->docente_id}\n";
echo "   Nombre: {$docente->perfil->primer_nombre} {$docente->perfil->apellido_paterno}\n";
echo "   Username: {$docente->user->username}\n\n";

// Ver sus horarios de clases
$horarios = \App\Models\HorarioClase::where('docente_id', $docente->docente_id)
    ->with(['bloque', 'docenteCurso.curso', 'docenteCurso.seccion'])
    ->get();

echo "=== HORARIOS DE CLASES ===\n";
echo "Total: " . $horarios->count() . "\n\n";

foreach ($horarios as $h) {
    echo "  - Día: {$h->dia} | Bloque: " . ($h->bloque->nombre ?? $h->bloque_id) . "\n";
    echo "    Curso: " . ($h->docenteCurso->curso->nombre ?? 'N/A') . "\n";
    echo "    Sección: " . ($h->docenteCurso->seccion->nombre ?? 'N/A') . "\n\n";
}

// Ver sus docente_cursos
echo "=== CURSOS ASIGNADOS ===\n";
$cursos = \App\Models\DocenteCurso::where('docente_id', $docente->docente_id)
    ->with(['curso', 'seccion'])
    ->get();

echo "Total: " . $cursos->count() . "\n";
foreach ($cursos as $dc) {
    echo "  - docen_curso_id: {$dc->docen_curso_id}\n";
    echo "    Curso: " . ($dc->curso->nombre ?? 'N/A') . "\n";
    echo "    Sección: " . ($dc->seccion->nombre ?? 'N/A') . "\n";
    echo "    apertura_id: " . ($dc->apertura_id ?? 'NULL') . "\n\n";
}
