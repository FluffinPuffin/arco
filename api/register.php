<?php
require_once __DIR__ . '/db.php';
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$displayName = trim($data['display_name'] ?? '');
$avatar = trim($data['avatar'] ?? '');
$grade = trim($data['grade'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters']);
    exit;
}

$db = getDB();

$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already registered']);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $db->prepare(
    'INSERT INTO users (email, password_hash, display_name, avatar, grade) VALUES (?, ?, ?, ?, ?)'
);
$stmt->execute([$email, $hash, $displayName, $avatar, $grade]);

$userId = (int) $db->lastInsertId();

$_SESSION['user_id'] = $userId;

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $userId,
        'email' => $email,
        'display_name' => $displayName,
        'avatar' => $avatar,
        'grade' => $grade,
    ],
]);
