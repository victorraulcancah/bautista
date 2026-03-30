<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1", "root", "");
    $res = $pdo->query("SHOW DATABASES LIKE 'edu_bautista3'");
    if ($res->rowCount() > 0) {
        echo "DATABASE_EXISTS\n";
    } else {
        echo "DATABASE_MISSING\n";
    }
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
