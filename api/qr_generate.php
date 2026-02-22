<?php
// Admin script: generate master QR key tokens
// Usage: GET /api/qr_generate.php?count=10&admin_token=YOUR_TOKEN
// Each output line is the full string to encode into a QR code.
// IMPORTANT: Restrict or delete this file after generating your keys.

require_once __DIR__ . '/db.php';

$adminToken = getenv('ADMIN_TOKEN') ?: 'arco_admin';
$provided   = $_GET['admin_token'] ?? $_POST['admin_token'] ?? '';

if ($provided !== $adminToken) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$count = max(1, min(100, (int) ($_GET['count'] ?? $_POST['count'] ?? 1)));

$db   = getDB();
$keys = [];

for ($i = 0; $i < $count; $i++) {
    $token = bin2hex(random_bytes(16)); // 32-char hex token
    $stmt  = $db->prepare('INSERT INTO qr_master_keys (token) VALUES (?)');
    $stmt->execute([$token]);
    $keys[] = 'ARCO-KEY-' . $token;
}

header('Content-Type: text/plain');
echo "Generated $count master key(s). Encode each line below as a QR code:\n\n";
foreach ($keys as $key) {
    echo $key . "\n";
}
