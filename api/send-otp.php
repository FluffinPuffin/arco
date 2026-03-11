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

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Generate a 4-digit OTP
$otp = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);

// Store OTP in session with 10-minute expiry
$_SESSION['otp']        = $otp;
$_SESSION['otp_email']  = $email;
$_SESSION['otp_expiry'] = time() + 600;

// Send email via Gmail SMTP
$sent = sendOtpEmail($email, $otp);

if (!$sent) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send verification email. Please try again.']);
    exit;
}

echo json_encode(['success' => true]);

// ─── Gmail SMTP mailer ────────────────────────────────────────────────────────

function sendOtpEmail($toEmail, $otp)
{
    $smtpHost  = 'smtp.gmail.com';
    $smtpPort  = 587;
    $username  = 'arcoLearningTeam@gmail.com';
    // Strip spaces — Gmail app passwords are shown with spaces but work without them
    $password  = str_replace(' ', '', getenv('ARCO_GMAIL_APP_PASSWORD') ?: '');

    if (!$password) {
        error_log('send-otp.php: ARCO_GMAIL_APP_PASSWORD env variable is not set');
        return false;
    }

    $fromEmail = 'arcoLearningTeam@gmail.com';
    $fromName  = 'Arco Learning';
    $subject   = 'Your Arco Verification Code';
    $body      = "Hello,\r\n\r\n"
               . "Your Arco Learning verification code is: {$otp}\r\n\r\n"
               . "This code expires in 10 minutes.\r\n\r\n"
               . "If you did not create an account, please ignore this email.\r\n\r\n"
               . "The Arco Learning Team";

    try {
        return smtpSend($smtpHost, $smtpPort, $username, $password,
                        $fromEmail, $fromName, $toEmail, $subject, $body);
    } catch (Exception $e) {
        error_log('send-otp.php SMTP error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Minimal Gmail SMTP send using PHP streams (no external dependencies).
 * PHP 7+ compatible. Uses STARTTLS on port 587.
 */
function smtpSend($host, $port, $user, $pass, $fromEmail, $fromName, $toEmail, $subject, $body)
{
    $errno = 0; $errstr = '';

    $sock = fsockopen($host, $port, $errno, $errstr, 15);
    if (!$sock) {
        throw new Exception("Cannot connect to {$host}:{$port} - {$errstr} ({$errno})");
    }

    stream_set_timeout($sock, 15);

    $read = function() use ($sock) {
        $buf = '';
        while (!feof($sock)) {
            $line = fgets($sock, 515);
            if ($line === false) break;
            $buf .= $line;
            // Line ending with "xxx " (space after code) = last line of response
            if (strlen($line) >= 4 && $line[3] === ' ') break;
        }
        return $buf;
    };

    $cmd = function($c) use ($sock, $read) {
        fwrite($sock, $c . "\r\n");
        return $read();
    };

    $expect = function($r, $code) {
        if (substr($r, 0, 3) !== $code) {
            throw new Exception("Expected {$code}, got: " . trim($r));
        }
    };

    // Greeting
    $r = $read();
    $expect($r, '220');

    // EHLO
    $r = $cmd("EHLO localhost");
    $expect($r, '250');

    // STARTTLS
    $r = $cmd("STARTTLS");
    $expect($r, '220');

    // Upgrade to TLS
    if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new Exception("TLS handshake failed");
    }

    // EHLO again after TLS
    $r = $cmd("EHLO localhost");
    $expect($r, '250');

    // AUTH LOGIN
    $r = $cmd("AUTH LOGIN");
    $expect($r, '334');

    $r = $cmd(base64_encode($user));
    $expect($r, '334');

    $r = $cmd(base64_encode($pass));
    $expect($r, '235');

    // MAIL FROM
    $r = $cmd("MAIL FROM:<{$fromEmail}>");
    $expect($r, '250');

    // RCPT TO
    $r = $cmd("RCPT TO:<{$toEmail}>");
    $expect($r, '250');

    // DATA
    $r = $cmd("DATA");
    $expect($r, '354');

    $date    = date('r');
    $message = "Date: {$date}\r\n"
             . "From: {$fromName} <{$fromEmail}>\r\n"
             . "To: {$toEmail}\r\n"
             . "Subject: {$subject}\r\n"
             . "MIME-Version: 1.0\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n"
             . "\r\n"
             . $body
             . "\r\n.";

    $r = $cmd($message);
    $expect($r, '250');

    $cmd("QUIT");
    fclose($sock);
    return true;
}
