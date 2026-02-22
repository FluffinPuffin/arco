<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userStmt = $db->prepare('SELECT premium_until FROM users WHERE id = ?');
    $userStmt->execute([$userId]);
    $userRow = $userStmt->fetch();
    $isPremium = $userRow && $userRow['premium_until'] && strtotime($userRow['premium_until']) > time();

    $stmt = $db->prepare(
        'SELECT lesson_id, part_completed, current_part_index, percentage, completed, last_updated FROM lesson_progress WHERE user_id = ?'
    );
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    $progress = [];
    foreach ($rows as $row) {
        $progress[$row['lesson_id']] = [
            'partCompleted' => json_decode($row['part_completed'], true),
            'currentPartIndex' => (int) $row['current_part_index'],
            'percentage' => (int) $row['percentage'],
            'completed' => (bool) $row['completed'],
            'lastUpdated' => $row['last_updated'],
        ];
    }

    echo json_encode(['success' => true, 'is_premium' => $isPremium, 'progress' => $progress]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $lessonId = $data['lesson_id'] ?? '';
    $partCompleted = $data['part_completed'] ?? [];
    $currentPartIndex = (int) ($data['current_part_index'] ?? 0);
    $percentage = (int) ($data['percentage'] ?? 0);
    $completed = (bool) ($data['completed'] ?? false);

    if (!$lessonId) {
        http_response_code(400);
        echo json_encode(['error' => 'lesson_id is required']);
        exit;
    }

    $stmt = $db->prepare(
        'INSERT INTO lesson_progress (user_id, lesson_id, part_completed, current_part_index, percentage, completed)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            part_completed = VALUES(part_completed),
            current_part_index = VALUES(current_part_index),
            percentage = VALUES(percentage),
            completed = VALUES(completed)'
    );
    $stmt->execute([
        $userId,
        $lessonId,
        json_encode($partCompleted),
        $currentPartIndex,
        $percentage,
        $completed ? 1 : 0,
    ]);

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
