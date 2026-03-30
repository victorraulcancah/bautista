<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=edu_bautista3", "root", "");
    $res = $pdo->query("SHOW TABLES");
    $tables = $res->fetchAll(PDO::FETCH_COLUMN);
    if (count($tables) > 0) {
        echo "TABLES_FOUND:" . count($tables) . "\n";
        foreach ($tables as $t) echo "- $t\n";
    } else {
        echo "NO_TABLES_FOUND\n";
    }
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
