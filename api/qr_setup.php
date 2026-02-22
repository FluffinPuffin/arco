<?php
// QR System Database Migration
// Run this ONCE to create the required tables, then delete or restrict access to this file.

require_once __DIR__ . '/db.php';

header('Content-Type: text/plain');

$db = getDB();

// CREATE TABLE steps
$tables = [
    'qr_master_keys' => "
        CREATE TABLE IF NOT EXISTS qr_master_keys (
            id INT PRIMARY KEY AUTO_INCREMENT,
            token VARCHAR(128) UNIQUE NOT NULL,
            used_by INT NULL,
            used_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ",
    'qr_sticker_unlocks' => "
        CREATE TABLE IF NOT EXISTS qr_sticker_unlocks (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            sticker_id INT NOT NULL,
            lesson_id VARCHAR(50) NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_sticker (user_id, sticker_id)
        )
    ",
];

foreach ($tables as $name => $sql) {
    try {
        $db->exec($sql);
        echo "[OK] $name\n";
    } catch (PDOException $e) {
        echo "[ERROR] $name: " . $e->getMessage() . "\n";
    }
}

// ALTER TABLE steps — check column existence first (compatible with MySQL 5.x+)
$dbName = getenv('DB_NAME') ?: 'arco';
$columns = [
    'qr_access_granted'    => "ALTER TABLE users ADD COLUMN qr_access_granted TINYINT(1) NOT NULL DEFAULT 0",
    'qr_access_granted_at' => "ALTER TABLE users ADD COLUMN qr_access_granted_at TIMESTAMP NULL",
];

foreach ($columns as $col => $sql) {
    $stmt = $db->prepare(
        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?"
    );
    $stmt->execute([$dbName, $col]);
    $exists = (bool) $stmt->fetchColumn();

    if ($exists) {
        echo "[SKIP] users.$col (already exists)\n";
    } else {
        try {
            $db->exec($sql);
            echo "[OK] users.$col\n";
        } catch (PDOException $e) {
            echo "[ERROR] users.$col: " . $e->getMessage() . "\n";
        }
    }
}

echo "\nSetup complete. Delete or restrict access to this file.\n";
