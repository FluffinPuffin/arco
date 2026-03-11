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

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$db = getDB();

$stmt = $db->prepare('SELECT id, email, password_hash, display_name, avatar, grade FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

$_SESSION['user_id'] = (int) $user['id'];

// Fetch lesson progress for this user
$stmt = $db->prepare('SELECT lesson_id, part_completed, current_part_index, percentage, completed FROM lesson_progress WHERE user_id = ?');
$stmt->execute([$user['id']]);
$progressRows = $stmt->fetchAll();

$progress = [];
foreach ($progressRows as $row) {
    $progress[$row['lesson_id']] = [
        'partCompleted' => json_decode($row['part_completed'], true),
        'currentPartIndex' => (int) $row['current_part_index'],
        'percentage' => (int) $row['percentage'],
        'completed' => (bool) $row['completed'],
    ];
}

echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int) $user['id'],
        'email' => $user['email'],
        'display_name' => $user['display_name'],
        'avatar' => $user['avatar'],
        'grade' => $user['grade'],
    ],
    'progress' => $progress,
]);
