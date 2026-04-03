<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

Schema::disableForeignKeyConstraints();
$tables = ['pago_notifica', 'pagos', 'estudiante_contacto', 'matriculas'];
foreach ($tables as $t) {
    if (Schema::hasTable($t)) {
        echo "Dropping $t...\n";
        Schema::drop($t);
        // Also remove from migrations table to allow re-running
        // Wait, migrate will handle it if the file is there and it's not in the 'migrations' table.
        // But if it IS in the migrations table and I drop it, 'migrate' will think it's already done.
        // So I should also delete the migration record.
    }
}

// Find migration records for these tables (approximate by searching file names)
$migrationFiles = [
    '2026_03_25_100002_create_matriculas_table',
    '2026_03_26_062803_create_pagos_tables',
    '2026_04_01_200000_create_pago_notifica_table'
];

foreach ($migrationFiles as $file) {
    DB::table('migrations')->where('migration', $file)->delete();
    echo "Deleted migration record for $file\n";
}

Schema::enableForeignKeyConstraints();
echo "Done.\n";
