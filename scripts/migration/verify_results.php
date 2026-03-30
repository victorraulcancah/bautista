<?php
$tables = ['users', 'perfiles', 'estudiantes', 'cursos', 'pagos', 'mensajes', 'cuestionario'];
$results = [];
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=edu_bautista3", "root", "");
    foreach ($tables as $t) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $t");
        $results[$t] = $stmt->fetchColumn();
    }
    echo "MIGRATION_STATS:\n";
    foreach ($results as $t => $c) echo "- $t: $c records\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
