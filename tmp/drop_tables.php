<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

Schema::disableForeignKeyConstraints();
$tables = ['institucion_pagosm', 'fechas_pagos', 'metodo_pago', 'hijos_matriculados', 'contenido_escrito', 'nota_actividad'];
foreach ($tables as $t) {
    echo "Dropping $t...\n";
    Schema::dropIfExists($t);
}
Schema::enableForeignKeyConstraints();
echo "Done.\n";
