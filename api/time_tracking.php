<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $seconds = isset($data['seconds']) ? (int)$data['seconds'] : 0;

    if ($seconds <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid seconds']);
        exit;
    }

    $today = date('Y-m-d');
    $stmt = $db->prepare(
        'INSERT INTO user_time (user_id, date, seconds) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE seconds = seconds + VALUES(seconds)'
    );
    $stmt->execute([$userId, $today, $seconds]);

    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $today = date('Y-m-d');

    // Today's total
    $stmt = $db->prepare('SELECT seconds FROM user_time WHERE user_id = ? AND date = ?');
    $stmt->execute([$userId, $today]);
    $row = $stmt->fetch();
    $todaySeconds = $row ? (int)$row['seconds'] : 0;

    // This week's total (Mon–today)
    $weekStart = date('Y-m-d', strtotime('monday this week'));
    $stmt = $db->prepare(
        'SELECT COALESCE(SUM(seconds), 0) AS total FROM user_time WHERE user_id = ? AND date BETWEEN ? AND ?'
    );
    $stmt->execute([$userId, $weekStart, $today]);
    $weekRow = $stmt->fetch();
    $weekSeconds = $weekRow ? (int)$weekRow['total'] : 0;

    // Last 7 days for bar charts
    $stmt = $db->prepare(
        'SELECT date, seconds FROM user_time
         WHERE user_id = ? AND date >= DATE_SUB(?, INTERVAL 6 DAY)
         ORDER BY date ASC'
    );
    $stmt->execute([$userId, $today]);
    $rows = $stmt->fetchAll();

    // Build a full 7-day array (fill missing days with 0)
    $daily = [];
    for ($i = 6; $i >= 0; $i--) {
        $daily[date('Y-m-d', strtotime("-$i days", strtotime($today)))] = 0;
    }
    foreach ($rows as $r) {
        $daily[$r['date']] = (int)$r['seconds'];
    }
    $dailyValues = array_values($daily);

    echo json_encode([
        'success' => true,
        'today_seconds' => $todaySeconds,
        'week_seconds' => $weekSeconds,
        'daily' => $dailyValues,
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
