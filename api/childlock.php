<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

// Self-healing migration: add childLock column if it doesn't exist yet
try {
    $db->exec("ALTER TABLE users ADD COLUMN childLock INT DEFAULT 1111");
} catch (\PDOException $e) {
    // Column already exists — ignore
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare('SELECT childLock FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    echo json_encode(['success' => true, 'childLock' => (string) $row['childLock']]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    $pin = $data['pin'] ?? '';

    if (!preg_match('/^\d{4}$/', $pin)) {
        http_response_code(400);
        echo json_encode(['error' => 'PIN must be exactly 4 digits']);
        exit;
    }

    if ($action === 'verify') {
        $stmt = $db->prepare('SELECT childLock FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        $storedPin = $row['childLock'] !== null ? (string) $row['childLock'] : '1111';
        $match = $storedPin === $pin;
        echo json_encode(['success' => $match]);
        exit;
    }

    if ($action === 'update') {
        $stmt = $db->prepare('UPDATE users SET childLock = ? WHERE id = ?');
        $stmt->execute([$pin, $userId]);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
