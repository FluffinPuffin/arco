<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare('SELECT id, email, display_name, avatar, grade FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    echo json_encode(['success' => true, 'user' => $user]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $fields = [];
    $values = [];

    if (isset($data['display_name'])) {
        $fields[] = 'display_name = ?';
        $values[] = trim($data['display_name']);
    }
    if (isset($data['avatar'])) {
        $fields[] = 'avatar = ?';
        $values[] = trim($data['avatar']);
    }
    if (isset($data['grade'])) {
        $fields[] = 'grade = ?';
        $values[] = trim($data['grade']);
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit;
    }

    $values[] = $userId;
    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($values);

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
