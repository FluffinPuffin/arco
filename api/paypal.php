<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

$clientId = getenv('PAYPAL_CLIENT_ID');
$secret    = getenv('PAYPAL_SECRET');
$env       = getenv('PAYPAL_ENV') ?: 'sandbox';
$baseUrl   = ($env === 'sandbox')
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

$planPrices = [
    '1-month'  => '4.99',
    '3-month'  => '11.25',
    '12-month' => '29.99',
];

$action = $_GET['action'] ?? '';

if ($action === 'create_order') {
    requireAuth();

    $body = json_decode(file_get_contents('php://input'), true);
    $plan = $body['plan'] ?? '';

    if (!isset($planPrices[$plan])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid plan']);
        exit;
    }

    $amount = $planPrices[$plan];
    $token  = getAccessToken($baseUrl, $clientId, $secret);

    if (!$token) {
        http_response_code(502);
        echo json_encode(['error' => 'Could not authenticate with PayPal']);
        exit;
    }

    $order = createOrder($baseUrl, $token, $amount);

    if (!$order || empty($order['id'])) {
        http_response_code(502);
        echo json_encode(['error' => 'Could not create PayPal order']);
        exit;
    }

    echo json_encode(['id' => $order['id']]);
    exit;
}

if ($action === 'capture_order') {
    $userId  = requireAuth();

    $body    = json_decode(file_get_contents('php://input'), true);
    $orderId = $body['orderID'] ?? '';

    if (!$orderId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing orderID']);
        exit;
    }

    $token = getAccessToken($baseUrl, $clientId, $secret);

    if (!$token) {
        http_response_code(502);
        echo json_encode(['error' => 'Could not authenticate with PayPal']);
        exit;
    }

    $capture = captureOrder($baseUrl, $token, $orderId);

    if (!$capture || ($capture['status'] ?? '') !== 'COMPLETED') {
        http_response_code(502);
        echo json_encode(['success' => false, 'error' => 'Payment capture failed']);
        exit;
    }

    // Record subscription and mark user as premium (best-effort — don't fail the response if DB write fails)
    try {
        $unit   = $capture['purchase_units'][0] ?? [];
        $amount = $unit['payments']['captures'][0]['amount']['value'] ?? '0.00';
        $plan   = $body['plan'] ?? 'unknown';

        $planMonths = ['1-month' => 1, '3-month' => 3, '12-month' => 12];
        $months     = $planMonths[$plan] ?? 1;
        $until      = (new DateTime())->modify("+$months months")->format('Y-m-d H:i:s');

        $pdo = getDB();
        $pdo->prepare(
            'INSERT INTO subscriptions (user_id, paypal_order_id, plan, amount, status) VALUES (?, ?, ?, ?, ?)'
        )->execute([$userId, $orderId, $plan, $amount, 'COMPLETED']);

        $pdo->prepare(
            'UPDATE users SET premium_until = ? WHERE id = ?'
        )->execute([$until, $userId]);
    } catch (Exception $e) {
        // Log but don't surface to user
        error_log('Subscription DB write failed: ' . $e->getMessage());
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAccessToken(string $baseUrl, string $clientId, string $secret): ?string
{
    $ch = curl_init("$baseUrl/v1/oauth2/token");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => 'grant_type=client_credentials',
        CURLOPT_USERPWD        => "$clientId:$secret",
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);
    return $data['access_token'] ?? null;
}

function createOrder(string $baseUrl, string $token, string $amount): ?array
{
    $payload = json_encode([
        'intent'         => 'CAPTURE',
        'purchase_units' => [[
            'amount' => [
                'currency_code' => 'USD',
                'value'         => $amount,
            ],
        ]],
    ]);

    $ch = curl_init("$baseUrl/v2/checkout/orders");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer $token",
            'Content-Type: application/json',
        ],
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

function captureOrder(string $baseUrl, string $token, string $orderId): ?array
{
    $ch = curl_init("$baseUrl/v2/checkout/orders/$orderId/capture");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => '{}',
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer $token",
            'Content-Type: application/json',
        ],
    ]);
    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}
