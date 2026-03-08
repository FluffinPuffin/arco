<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$userId = requireAuth();
$data = json_decode(file_get_contents('php://input'), true);

$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';

if (!$currentPassword || !$newPassword) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters']);
    exit;
}

if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $newPassword)) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must contain at least one special character']);
    exit;
}

$db = getDB();

$stmt = $db->prepare('SELECT password_hash FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Current password is incorrect']);
    exit;
}

$hash = password_hash($newPassword, PASSWORD_BCRYPT);
$stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$stmt->execute([$hash, $userId]);

echo json_encode(['success' => true]);
