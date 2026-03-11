<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch user's streak data
    $streakStmt = $db->prepare('SELECT current_streak, longest_streak, last_login_date FROM user_streaks WHERE user_id = ?');
    $streakStmt->execute([$userId]);
    $streak = $streakStmt->fetch();

    if (!$streak) {
        // Initialize streak record for new users (handle race condition)
        try {
            $db->prepare('INSERT INTO user_streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)')
               ->execute([$userId]);
        } catch (PDOException $e) {
            // Duplicate entry from race condition - just fetch it
            if ($e->getCode() != 23000) {
                throw $e;
            }
            $streakStmt->execute([$userId]);
            $streak = $streakStmt->fetch();
        }
        if (!$streak) {
            $streak = ['current_streak' => 0, 'longest_streak' => 0, 'last_login_date' => null];
        }
    }

    // Use client-supplied date so the user's local timezone determines the current day
    $clientDate = isset($_GET['client_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['client_date'])
        ? $_GET['client_date']
        : date('Y-m-d');

    // Get this week's login days (Monday-Friday)
    $today = new DateTime($clientDate);
    $dayOfWeek = (int) $today->format('N'); // 1=Mon, 7=Sun

    // Calculate Monday of current week
    $daysFromMonday = $dayOfWeek - 1;
    $monday = (clone $today)->modify("-{$daysFromMonday} days")->format('Y-m-d');

    // Calculate Friday of current week
    $daysToFriday = 5 - $dayOfWeek;
    $friday = (clone $today)->modify("+{$daysToFriday} days")->format('Y-m-d');

    $loginsStmt = $db->prepare(
        'SELECT login_date FROM daily_logins
         WHERE user_id = ? AND login_date BETWEEN ? AND ?
         ORDER BY login_date'
    );
    $loginsStmt->execute([$userId, $monday, $friday]);
    $loginDates = $loginsStmt->fetchAll(PDO::FETCH_COLUMN);

    // Convert to weekday array [M, T, W, T, F]
    $weekDays = [false, false, false, false, false];
    foreach ($loginDates as $dateStr) {
        $date = new DateTime($dateStr);
        $dayOfWeek = (int) $date->format('N'); // 1=Mon, 2=Tue, ..., 7=Sun
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5) {
            $weekDays[$dayOfWeek - 1] = true;
        }
    }

    echo json_encode([
        'success' => true,
        'streak' => [
            'currentStreak' => (int) $streak['current_streak'],
            'longestStreak' => (int) $streak['longest_streak'],
            'lastLoginDate' => $streak['last_login_date'],
            'weekDays' => $weekDays
        ]
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Record today's login and update streak
    $data = json_decode(file_get_contents('php://input'), true);

    // Use client-supplied date so the user's local timezone determines the current day
    $today = isset($data['client_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['client_date'])
        ? $data['client_date']
        : date('Y-m-d');

    $todayDate = new DateTime($today);
    $todayDayOfWeek = (int) $todayDate->format('N'); // 1=Mon, ..., 7=Sun

    // Skip weekends
    if ($todayDayOfWeek === 6 || $todayDayOfWeek === 7) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Weekends do not count toward streaks',
            'isWeekend' => true
        ]);
        exit;
    }

    // Check if already logged in today
    $checkStmt = $db->prepare('SELECT id FROM daily_logins WHERE user_id = ? AND login_date = ?');
    $checkStmt->execute([$userId, $today]);
    $alreadyLogged = $checkStmt->fetch();

    if ($alreadyLogged) {
        // Already logged today, just return current data
        $streakStmt = $db->prepare('SELECT current_streak, longest_streak, last_login_date FROM user_streaks WHERE user_id = ?');
        $streakStmt->execute([$userId]);
        $streak = $streakStmt->fetch();

        // Ensure streak record exists (edge case for brand new users)
        if (!$streak) {
            $streak = ['current_streak' => 1, 'longest_streak' => 1, 'last_login_date' => $today];
        }

        echo json_encode([
            'success' => true,
            'alreadyRecorded' => true,
            'streak' => [
                'currentStreak' => (int) $streak['current_streak'],
                'longestStreak' => (int) $streak['longest_streak'],
                'lastLoginDate' => $streak['last_login_date']
            ]
        ]);
        exit;
    }

    // Record today's login
    try {
        $db->prepare('INSERT INTO daily_logins (user_id, login_date) VALUES (?, ?)')
           ->execute([$userId, $today]);
    } catch (PDOException $e) {
        // Duplicate entry (race condition), treat as already logged
        if ($e->getCode() == 23000) {
            http_response_code(200);
            echo json_encode(['success' => true, 'alreadyRecorded' => true]);
            exit;
        }
        throw $e;
    }

    // Calculate streak - ensure user_streaks record exists
    $streakStmt = $db->prepare('SELECT current_streak, longest_streak, last_login_date FROM user_streaks WHERE user_id = ?');
    $streakStmt->execute([$userId]);
    $streak = $streakStmt->fetch();

    // If no streak record exists, initialize it (new user edge case)
    if (!$streak) {
        try {
            $db->prepare('INSERT INTO user_streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)')
               ->execute([$userId]);
            $streak = ['current_streak' => 0, 'longest_streak' => 0, 'last_login_date' => null];
        } catch (PDOException $e) {
            // Race condition - fetch again
            if ($e->getCode() == 23000) {
                $streakStmt->execute([$userId]);
                $streak = $streakStmt->fetch();
            } else {
                throw $e;
            }
        }
    }

    $newStreak = 1;
    $lastLoginDate = $streak['last_login_date'] ?? null;

    if ($lastLoginDate) {
        $lastLogin = new DateTime($lastLoginDate);
        $todayDate = new DateTime($today);
        $interval = $lastLogin->diff($todayDate);
        $daysDiff = (int) $interval->days;

        $lastDayOfWeek = (int) $lastLogin->format('N');

        // Check if consecutive (handles Friday->Monday as 3 days)
        $isConsecutive = false;
        if ($lastDayOfWeek === 5 && $todayDayOfWeek === 1 && $daysDiff === 3) {
            // Friday to Monday
            $isConsecutive = true;
        } elseif ($daysDiff === 1 && $todayDayOfWeek >= 1 && $todayDayOfWeek <= 5) {
            // Normal consecutive weekday
            $isConsecutive = true;
        }

        if ($isConsecutive) {
            $newStreak = (int) $streak['current_streak'] + 1;
        }
    }

    $longestStreak = max((int) ($streak['longest_streak'] ?? 0), $newStreak);

    // Update streak record
    $updateStmt = $db->prepare(
        'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_login_date)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            current_streak = ?,
            longest_streak = ?,
            last_login_date = ?'
    );
    $updateStmt->execute([$userId, $newStreak, $longestStreak, $today, $newStreak, $longestStreak, $today]);

    echo json_encode([
        'success' => true,
        'streak' => [
            'currentStreak' => $newStreak,
            'longestStreak' => $longestStreak,
            'lastLoginDate' => $today
        ]
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
