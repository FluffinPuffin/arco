<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $data['action'] ?? '';
$db = getDB();

if ($action === 'list_tables') {
    $stmt = $db->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode(['success' => true, 'tables' => $tables]);
    exit;
}

if ($action === 'get_table') {
    $table  = $data['table'] ?? '';
    $limit  = max(1, min(200, (int)($data['limit']  ?? 50)));
    $offset = max(0, (int)($data['offset'] ?? 0));

    $stmt = $db->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array($table, $tables, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid table']);
        exit;
    }

    $total = (int) $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    $rows  = $db->query("SELECT * FROM `$table` LIMIT $limit OFFSET $offset")->fetchAll();

    if (!empty($rows)) {
        $columns = array_keys($rows[0]);
    } else {
        $columns = $db->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN);
    }

    echo json_encode(['success' => true, 'columns' => $columns, 'rows' => $rows, 'total' => $total]);
    exit;
}

if ($action === 'update_row') {
    $table  = $data['table']  ?? '';
    $pk     = $data['pk']     ?? '';
    $pkVal  = $data['pk_val'] ?? null;
    $col    = $data['col']    ?? '';
    $val    = $data['val']    ?? null;

    $tables = $db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array($table, $tables, true)) {
        http_response_code(400); echo json_encode(['error' => 'Invalid table']); exit;
    }

    $cols = $db->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array($pk, $cols, true) || !in_array($col, $cols, true)) {
        http_response_code(400); echo json_encode(['error' => 'Invalid column']); exit;
    }

    $db->prepare("UPDATE `$table` SET `$col` = ? WHERE `$pk` = ?")->execute([$val, $pkVal]);
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'delete_row') {
    $table = $data['table'] ?? '';
    $pk    = $data['pk']    ?? '';
    $pkVal = $data['pk_val'] ?? null;

    $tables = $db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array($table, $tables, true)) {
        http_response_code(400); echo json_encode(['error' => 'Invalid table']); exit;
    }

    $cols = $db->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array($pk, $cols, true)) {
        http_response_code(400); echo json_encode(['error' => 'Invalid column']); exit;
    }

    $db->prepare("DELETE FROM `$table` WHERE `$pk` = ?")->execute([$pkVal]);
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'run_migrations') {
    $statements = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            display_name VARCHAR(100) DEFAULT '',
            avatar VARCHAR(255) DEFAULT '',
            grade VARCHAR(20) DEFAULT '',
            premium_until DATETIME DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until DATETIME DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_access_granted TINYINT(1) NOT NULL DEFAULT 0",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_access_granted_at TIMESTAMP NULL",
        "CREATE TABLE IF NOT EXISTS lesson_progress (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            lesson_id VARCHAR(20) NOT NULL,
            part_completed JSON,
            current_part_index INT DEFAULT 0,
            percentage INT DEFAULT 0,
            completed BOOLEAN DEFAULT FALSE,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_lesson (user_id, lesson_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        "CREATE TABLE IF NOT EXISTS subscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT DEFAULT NULL,
            paypal_order_id VARCHAR(50) NOT NULL,
            plan VARCHAR(20) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'COMPLETED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS qr_master_keys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(128) UNIQUE NOT NULL,
            used_by INT NULL,
            used_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS qr_sticker_unlocks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            sticker_id INT NOT NULL,
            lesson_id VARCHAR(50) NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_user_sticker (user_id, sticker_id)
        )",
            "CREATE TABLE user_streaks (
            user_id INT PRIMARY KEY,
            current_streak INT NOT NULL DEFAULT 0,
            longest_streak INT NOT NULL DEFAULT 0,
            last_login_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
            "CREATE TABLE daily_logins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            login_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_date (user_id, login_date),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_date (user_id, login_date)
        )",
    ];

    foreach ($statements as $sql) {
        try { $db->exec($sql); } catch (PDOException $e) { /* skip already-exists errors */ }
    }

    $tables = $db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode(['success' => true, 'tables' => $tables]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
