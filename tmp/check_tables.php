<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$tables = [
    'institucion_pagosm', 'fechas_pagos', 'metodo_pago', 
    'asistencia', 'hijos_matriculados', 'contenido_escrito', 
    'recuperacion_usuario', 'nota_actividad'
];

foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        $count = DB::table($table)->count();
        echo "TABLE $table EXISTS WITH $count RECORDS\n";
    } else {
        echo "TABLE $table DOES NOT EXIST\n";
    }
}
