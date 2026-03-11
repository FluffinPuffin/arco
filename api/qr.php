<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

// ──────────────────────────────────────────
// validate_key: consume a master key and grant QR access
// ──────────────────────────────────────────
if ($action === 'validate_key') {
    $token = trim($data['token'] ?? '');

    if (!$token) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token is required']);
        exit;
    }

    // Find an unused key with this token
    $stmt = $db->prepare('SELECT id FROM qr_master_keys WHERE token = ? AND used_by IS NULL');
    $stmt->execute([$token]);
    $key = $stmt->fetch();

    if (!$key) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This key is invalid or has already been used.']);
        exit;
    }

    // Mark key as used
    $stmt = $db->prepare('UPDATE qr_master_keys SET used_by = ?, used_at = NOW() WHERE id = ?');
    $stmt->execute([$userId, $key['id']]);

    // Grant permanent QR access to user
    $stmt = $db->prepare('UPDATE users SET qr_access_granted = 1, qr_access_granted_at = NOW() WHERE id = ?');
    $stmt->execute([$userId]);

    echo json_encode(['success' => true, 'message' => 'Book access unlocked! You can now scan sticker codes.']);
    exit;
}

// ──────────────────────────────────────────
// unlock_sticker: unlock a sticker via QR (requires QR access)
// ──────────────────────────────────────────
if ($action === 'unlock_sticker') {
    $lessonId  = trim($data['lesson_id'] ?? '');
    $stickerId = (int) ($data['sticker_id'] ?? 0);

    if (!$lessonId || !$stickerId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'lesson_id and sticker_id are required']);
        exit;
    }

    // Check if user has QR access
    $stmt = $db->prepare('SELECT qr_access_granted FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user['qr_access_granted']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'no_access']);
        exit;
    }

    // Check if already unlocked
    $stmt = $db->prepare('SELECT id FROM qr_sticker_unlocks WHERE user_id = ? AND sticker_id = ?');
    $stmt->execute([$userId, $stickerId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => true, 'already_unlocked' => true, 'sticker_id' => $stickerId]);
        exit;
    }

    // Insert unlock record
    $stmt = $db->prepare(
        'INSERT IGNORE INTO qr_sticker_unlocks (user_id, sticker_id, lesson_id) VALUES (?, ?, ?)'
    );
    $stmt->execute([$userId, $stickerId, $lessonId]);

    echo json_encode(['success' => true, 'already_unlocked' => false, 'sticker_id' => $stickerId]);
    exit;
}

// ──────────────────────────────────────────
// get_qr_status: return user's QR access + all unlocked stickers
// ──────────────────────────────────────────
if ($action === 'get_qr_status') {
    $stmt = $db->prepare('SELECT qr_access_granted FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    $stmt = $db->prepare(
        'SELECT sticker_id, lesson_id, unlocked_at FROM qr_sticker_unlocks WHERE user_id = ?'
    );
    $stmt->execute([$userId]);
    $unlocks = $stmt->fetchAll();

    // Cast sticker_id to int for JS
    foreach ($unlocks as &$u) {
        $u['sticker_id'] = (int) $u['sticker_id'];
    }

    echo json_encode([
        'success' => true,
        'qr_access_granted' => (bool) $user['qr_access_granted'],
        'sticker_unlocks' => $unlocks,
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
