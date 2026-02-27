# Streak System Backend Implementation Guide

## Overview

This guide explains how to implement backend storage for the user streak tracking system in the Arco application. The current implementation uses localStorage which causes all users on the same browser to share the same streak data. This backend implementation ensures each user has their own streak data that persists across devices and browsers.

## Current Problem

The existing streak system stores data in localStorage using a global key (`'arcoStreakData'`), which means:
- All users on the same browser share the same streak counter
- Streak data doesn't sync across devices
- Users can manipulate their streak via browser console
- Data is lost if localStorage is cleared

## Solution Architecture

Move streak data to the backend database where it's stored per user ID and accessed via API endpoints.

---

## Step 1: Database Schema Changes

Add two tables to your MySQL database:

```sql
-- Stores the current streak summary for each user
CREATE TABLE user_streaks (
    user_id INT PRIMARY KEY,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_login_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stores individual login records for detailed tracking
CREATE TABLE daily_logins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, login_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, login_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Why two tables?**
- `user_streaks`: Fast lookup for current streak count
- `daily_logins`: Historical record of all login dates (generates week view, enables analytics)

---

## Step 2: Create Backend API Endpoint

Create `/arco/api/streak.php`:

```php
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
        // Initialize streak record for new users
        $db->prepare('INSERT INTO user_streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)')
           ->execute([$userId]);
        $streak = ['current_streak' => 0, 'longest_streak' => 0, 'last_login_date' => null];
    }
    
    // Get this week's login days (Monday-Friday)
    $monday = date('Y-m-d', strtotime('monday this week'));
    $friday = date('Y-m-d', strtotime('friday this week'));
    
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
    $today = date('Y-m-d');
    $todayDayOfWeek = (int) date('N'); // 1=Mon, ..., 7=Sun
    
    // Skip weekends
    if ($todayDayOfWeek === 6 || $todayDayOfWeek === 7) {
        http_response_code(400);
        echo json_encode(['error' => 'Weekends do not count toward streaks']);
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
    
    // Calculate streak
    $streakStmt = $db->prepare('SELECT current_streak, longest_streak, last_login_date FROM user_streaks WHERE user_id = ?');
    $streakStmt->execute([$userId]);
    $streak = $streakStmt->fetch();
    
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
            current_streak = VALUES(current_streak),
            longest_streak = VALUES(longest_streak),
            last_login_date = VALUES(last_login_date)'
    );
    $updateStmt->execute([$userId, $newStreak, $longestStreak, $today]);
    
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
```

**Key Features:**
- Uses existing `requireAuth()` function for session authentication
- `GET /api/streak.php`: Returns current streak + this week's login days
- `POST /api/streak.php`: Records today's login and calculates new streak
- Handles race conditions (duplicate login attempts)
- Calculates Friday→Monday as consecutive weekdays
- Tracks longest streak as personal best
- Skips weekends (Saturday/Sunday don't count)

---

## Step 3: Add API Methods to ArcoAPI

Update `/arco/js/api.js` to add streak endpoints:

```javascript
const ArcoAPI = {
  // ... existing methods (register, login, logout, etc.) ...

  // Streaks
  getStreak() {
    return this._fetch('/api/streak.php');
  },

  recordLogin() {
    return this._fetch('/api/streak.php', {
      method: 'POST'
    });
  },
};
```

These methods follow the same pattern as your existing API methods like `getProgress()` and `getProfile()`.

---

## Step 4: Update Frontend JavaScript

Replace the streak tracker section in `/arco/Home/js/js.js`:

**Remove these functions entirely:**
- `initializeStreakTracker()` (old version)
- `getStreakData()`
- `saveStreakData()`
- `normalizeDate()`
- `getWeekdayIndex()`
- `isSameDay()`
- `isConsecutiveWeekday()`
- `isSameWeek()`
- `isValidStreakData()`
- `isLocalStorageAvailable()`

**Replace with this simplified implementation:**

```javascript
// Streak Tracker Functionality
async function initializeStreakTracker() {
    try {
        // Call backend to record login and get updated streak
        const response = await ArcoAPI.recordLogin();
        
        if (response.success) {
            // Fetch the full week data
            const streakData = await ArcoAPI.getStreak();
            updateStreakUI(streakData.streak);
        }
    } catch (err) {
        console.error('Failed to load streak data:', err);
        // Show default UI if backend fails
        updateStreakUI({
            currentStreak: 0,
            weekDays: [false, false, false, false, false]
        });
    }
}

function updateStreakUI(streakData) {
    const dayElements = document.querySelectorAll('.streak-days .day');
    const streakCountElement = document.querySelector('.streak-count');
    
    // Update day indicators
    dayElements.forEach((dayEl, index) => {
        if (index < streakData.weekDays.length && streakData.weekDays[index]) {
            dayEl.classList.add('filled');
        } else {
            dayEl.classList.remove('filled');
        }
    });
    
    // Update streak count
    if (streakCountElement) {
        const count = streakData.currentStreak || 0;
        const plural = count === 1 ? 'day' : 'days';
        streakCountElement.textContent = `${count.toString().padStart(2, '0')} ${plural} streak`;
    }
}
```

**Key Changes:**
- All complex date logic moved to backend
- Frontend only handles API calls and UI updates
- Graceful fallback if backend is unavailable
- Much simpler and cleaner code

---

## Step 5: Update Login Flow

In `/arco/Login/js/js.js`, after successful login (around line 76), store the user ID:

```javascript
// After storing user profile data:
if (user.display_name) localStorage.setItem('arco-name', user.display_name);
if (user.avatar) localStorage.setItem('arco-avatar', user.avatar);
if (user.grade) localStorage.setItem('arco-grade', user.grade);
if (user.id) localStorage.setItem('arco-userId', user.id);  // ADD THIS LINE
```

**Note:** This isn't strictly required for the streak system (backend uses session authentication), but it's useful for other client-side features that need the user ID.

---

## Complete Application Flow

```
1. User Opens Home Page
       ↓
2. frame:ready event fires
       ↓
3. content.html loads into page
       ↓
4. initializeStreakTracker() called
       ↓
5. Frontend: ArcoAPI.recordLogin() → POST /api/streak.php
       ↓
6. Backend: Checks session via requireAuth() to get user_id
       ↓
7. Backend: Checks if user already logged in today
       ↓
8. Backend: If new day → Insert record into daily_logins table
       ↓
9. Backend: Fetches last_login_date from user_streaks
       ↓
10. Backend: Calculates if login is consecutive:
       - Normal: 1 day apart (Mon→Tue, Tue→Wed, etc.)
       - Weekend: 3 days apart (Fri→Mon)
       ↓
11. Backend: Updates current_streak (increment or reset to 1)
       ↓
12. Backend: Updates longest_streak if new record
       ↓
13. Backend: Saves to user_streaks table
       ↓
14. Backend: Returns updated streak data
       ↓
15. Frontend: ArcoAPI.getStreak() → GET /api/streak.php
       ↓
16. Backend: Fetches this week's logins (Monday-Friday)
       ↓
17. Backend: Converts dates to weekDays array [M,T,W,T,F]
       ↓
18. Backend: Returns streak data + weekDays array
       ↓
19. Frontend: updateStreakUI() applies .filled class to completed days
       ↓
20. Frontend: Updates streak count text (e.g., "05 days streak")
```

---

## Benefits of Backend Implementation

### User-Specific:
- Each user has their own streak stored by `user_id`
- Switching browsers/devices shows the same streak
- No confusion when multiple users use the same computer

### Secure:
- Users cannot manipulate streak via browser console
- Server-side validation ensures data integrity
- Session authentication required for all operations

### Reliable:
- Data persists even if localStorage is cleared
- Survives browser upgrades and cache clears
- Professional database backup strategies apply
- Cross-device synchronization

### Analytics-Ready:
- Can query aggregate statistics (average streak across all users)
- Can identify highly engaged users
- Can generate reports on daily active users
- Historical data available for analysis

---

## API Endpoint Reference

### GET /api/streak.php

**Purpose:** Retrieve user's current streak and this week's activity

**Authentication:** Required (session-based)

**Response:**
```json
{
  "success": true,
  "streak": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastLoginDate": "2026-02-25",
    "weekDays": [true, true, true, true, true]
  }
}
```

**weekDays Array:** Boolean array for [Monday, Tuesday, Wednesday, Thursday, Friday]

---

### POST /api/streak.php

**Purpose:** Record today's login and calculate updated streak

**Authentication:** Required (session-based)

**Request Body:** None (uses server date and session user_id)

**Response (New Login):**
```json
{
  "success": true,
  "streak": {
    "currentStreak": 6,
    "longestStreak": 12,
    "lastLoginDate": "2026-02-26"
  }
}
```

**Response (Already Logged Today):**
```json
{
  "success": true,
  "alreadyRecorded": true,
  "streak": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastLoginDate": "2026-02-25"
  }
}
```

**Error Response (Weekend):**
```json
{
  "error": "Weekends do not count toward streaks"
}
```

---

## Streak Calculation Logic

### Consecutive Day Rules:

1. **Normal Weekdays:** Must be exactly 1 day apart
   - Monday → Tuesday ✅
   - Tuesday → Wednesday ✅
   - etc.

2. **Weekend Bridge:** Friday → Monday counts as consecutive
   - Checks if last login was Friday (day 5)
   - Checks if today is Monday (day 1)
   - Checks if 3 days apart
   - If all true → Streak continues ✅

3. **Streak Break:** Any other gap resets streak to 1
   - Monday → Wednesday (skipped Tuesday) ❌ Reset to 1
   - Friday → Tuesday (skipped Monday) ❌ Reset to 1

### Weekend Handling:

- Saturday and Sunday logins return error
- They don't count toward or break streaks
- Week view only shows Monday-Friday

---

## Code Integration Points

### Files Modified:

1. **Database:** Add two new tables (`user_streaks`, `daily_logins`)
2. **Backend API:** Create `/arco/api/streak.php`
3. **API Helper:** Update `/arco/js/api.js` (add `getStreak()` and `recordLogin()`)
4. **Frontend:** Update `/arco/Home/js/js.js` (replace streak functions)
5. **Login:** Update `/arco/Login/js/js.js` (store user.id)

### No Changes Needed:

- HTML structure (`/arco/Home/html/content.html`)
- CSS styles (`/arco/Home/css/style.css`)
- Authentication system (already works with sessions)
- Other API endpoints

---

## Testing Scenarios

Test these cases after implementation:

| Scenario | Expected Result |
|----------|----------------|
| New user first login | Streak = 1, only today filled |
| Same user, same day, multiple page loads | Streak = 1 (doesn't increment) |
| User logs in consecutive days | Streak increments each day |
| User logs in Fri, then Mon | Streak continues (+1) |
| User misses a weekday | Streak resets to 1 |
| User A and User B on same computer | Each sees own streak |
| User logs in on phone, then laptop | Same streak on both |
| localStorage cleared | Streak still accurate (from DB) |
| Backend temporarily down | Shows default "00 days streak" |
| User logs in on Saturday | Returns error, no update |

---

## Implementation Checklist

- [ ] Run SQL schema to create `user_streaks` and `daily_logins` tables
- [ ] Create `/arco/api/streak.php` file
- [ ] Add `getStreak()` and `recordLogin()` methods to ArcoAPI in `/arco/js/api.js`
- [ ] Replace streak functions in `/arco/Home/js/js.js`
- [ ] Add `user.id` storage in `/arco/Login/js/js.js`
- [ ] Test with multiple user accounts
- [ ] Test Friday→Monday streak continuation
- [ ] Test same-day multiple logins (idempotency)
- [ ] Test offline/backend failure fallback
- [ ] Verify week view updates correctly

---

## Architecture Comparison

### Before (localStorage):
```
Browser localStorage
    ↓
  Global key: 'arcoStreakData'
    ↓
  Shared by all users
```

### After (Backend):
```
MySQL Database
    ↓
  user_streaks table (per user_id)
  daily_logins table (per user_id)
    ↓
  API endpoints (session authenticated)
    ↓
  Frontend UI (read-only display)
```

---

## Notes

- This implementation follows the existing Arco patterns (PDO, session auth, JSON responses)
- The backend handles all business logic (consecutive day calculation, weekend handling)
- Frontend is simplified to just API calls and UI rendering
- Error handling includes graceful fallbacks for offline/backend failures
- Race conditions are handled (duplicate login attempts on same day)
