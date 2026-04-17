<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Matricula;
use App\Models\Estudiante;

$dni = '77000001';
echo "Checking matriculas for DNI: $dni\n";

$estudiante = Estudiante::whereHas('perfil', function($q) use ($dni) {
    $q->where('doc_numero', $dni);
})->first();

if (!$estudiante) {
    echo "Estudiante not found.\n";
    exit;
}

$matriculas = Matricula::where('estu_id', $estudiante->estu_id)->get();

foreach ($matriculas as $m) {
    echo "Matricula ID: {$m->matricula_id}, Year: {$m->anio}, Created At: {$m->created_at}\n";
}
