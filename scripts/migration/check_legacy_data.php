<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=edu_bautista", "root", "");
    $stmt = $pdo->query("SELECT COUNT(*) FROM mensaje_usuarion");
    echo "LEGACY_MESSAGES:" . $stmt->fetchColumn() . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
