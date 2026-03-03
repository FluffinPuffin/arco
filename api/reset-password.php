<?php
require_once __DIR__ . '/db.php';
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data   = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? 'reset';
$email  = trim($data['email'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

$db = getDB();

$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => '*No account associated with that email exists.']);
    exit;
}

// Step 1: just check the email exists
if ($action === 'check') {
    echo json_encode(['success' => true]);
    exit;
}

// Step 2: update the password
$newPassword = $data['new_password'] ?? '';

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

$hash = password_hash($newPassword, PASSWORD_BCRYPT);

$stmt = $db->prepare('UPDATE users SET password_hash = ? WHERE email = ?');
$stmt->execute([$hash, $email]);

echo json_encode(['success' => true]);
