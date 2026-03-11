<?php
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$otp   = trim($data['otp']   ?? '');

if (!$email || !$otp) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and OTP are required']);
    exit;
}

// Check OTP exists in session
if (empty($_SESSION['otp']) || empty($_SESSION['otp_email']) || empty($_SESSION['otp_expiry'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No verification code found. Please request a new one.']);
    exit;
}

// Check expiry
if (time() > $_SESSION['otp_expiry']) {
    unset($_SESSION['otp'], $_SESSION['otp_email'], $_SESSION['otp_expiry']);
    http_response_code(400);
    echo json_encode(['error' => 'Verification code has expired. Please request a new one.']);
    exit;
}

// Check email matches
if (strtolower($email) !== strtolower($_SESSION['otp_email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email mismatch.']);
    exit;
}

// Check OTP matches
if ($otp !== $_SESSION['otp']) {
    http_response_code(400);
    echo json_encode(['error' => 'Incorrect verification code.']);
    exit;
}

// Valid — clear OTP from session
unset($_SESSION['otp'], $_SESSION['otp_email'], $_SESSION['otp_expiry']);

echo json_encode(['success' => true]);
