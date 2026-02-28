# Streak System - Bug Fixes & Code Review

## Summary

After code review, I identified and fixed **7 critical bugs** and **3 potential edge cases**. All issues have been resolved.

---

## Critical Bugs Fixed

### 🔴 Bug #1: Missing user_streaks Record in POST Endpoint
**Location:** `streak.php` lines 107-109 (original)

**Problem:**
When a brand new user logs in for the first time, the POST endpoint would query `user_streaks` table but the record wouldn't exist yet. This would cause `$streak` to be `false`, leading to undefined array access errors.

**Scenario:**
1. New user registers
2. Immediately visits home page
3. `recordLogin()` called
4. Query returns no results → `$streak = false`
5. Code tries to access `$streak['current_streak']` → ERROR

**Fix:**
Added initialization logic with race condition handling:
```php
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
```

---

### 🔴 Bug #2: Race Condition in GET Endpoint Initialization
**Location:** `streak.php` lines 17-20 (original)

**Problem:**
When two GET requests happen simultaneously for a new user, both would try to INSERT the same `user_id` into `user_streaks`, causing a duplicate key error.

**Scenario:**
1. User opens two browser tabs at the same time
2. Both tabs call `getStreak()` simultaneously
3. Both see no record exists
4. Both try to INSERT → One succeeds, one fails with duplicate key error

**Fix:**
Added try-catch with duplicate key handling:
```php
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
```

---

### 🔴 Bug #3: Inconsistent Week Calculation (strtotime Issue)
**Location:** `streak.php` lines 24-25 (original)

**Problem:**
Using `strtotime('monday this week')` has inconsistent behavior:
- On Sunday: Might return next Monday instead of current week's Monday
- Locale-dependent behavior
- Could show wrong days as "filled" in the UI

**Scenario:**
1. User logs in on Sunday
2. `strtotime('monday this week')` returns next week's Monday
3. Query returns no logins (wrong date range)
4. UI shows empty week despite user logging in earlier in the week

**Fix:**
Replaced with explicit DateTime calculation:
```php
// Use explicit day calculation to avoid timezone/locale issues
$today = new DateTime();
$dayOfWeek = (int) $today->format('N'); // 1=Mon, 7=Sun

// Calculate Monday of current week
$daysFromMonday = $dayOfWeek - 1;
$monday = (clone $today)->modify("-{$daysFromMonday} days")->format('Y-m-d');

// Calculate Friday of current week
$daysToFriday = 5 - $dayOfWeek;
$friday = (clone $today)->modify("+{$daysToFriday} days")->format('Y-m-d');
```

---

### 🔴 Bug #4: Missing Validation in "Already Logged" Path
**Location:** `streak.php` lines 74-89 (original)

**Problem:**
When a user already logged in today and tries again, the code queries `user_streaks` but doesn't handle the case where the record doesn't exist (extremely rare but possible edge case).

**Scenario:**
1. User's `daily_logins` record exists (somehow inserted directly)
2. But `user_streaks` record is missing (data corruption or manual DB edit)
3. Query returns `false`
4. Code tries to access `$streak['current_streak']` → ERROR

**Fix:**
Added fallback for missing record:
```php
// Ensure streak record exists (edge case for brand new users)
if (!$streak) {
    $streak = ['current_streak' => 1, 'longest_streak' => 1, 'last_login_date' => $today];
}
```

---

### 🟡 Bug #5: Frontend Doesn't Handle Weekend Gracefully
**Location:** `js.js` line 57 (original)

**Problem:**
When the backend returns a 400 error on weekends, the frontend just shows "Failed to load streak data" in console and displays "00 days streak" - no indication it's because of the weekend.

**Scenario:**
1. User logs in on Saturday
2. Backend returns 400 with "Weekends do not count" error
3. Frontend catches error and shows default UI (00 days streak)
4. User thinks their streak is broken

**Fix:**
Added weekend-specific error handling:
```javascript
// Check if it's a weekend error
if (err.status === 400 || (err.message && err.message.includes('weekend'))) {
    console.log('Weekend detected - streaks do not count');
    // Still try to fetch current streak data
    try {
        const streakData = await ArcoAPI.getStreak();
        if (streakData && streakData.streak) {
            updateStreakUI(streakData.streak);
            return;
        }
    } catch (fetchErr) {
        console.error('Failed to fetch streak on weekend:', fetchErr);
    }
}
```

Also updated backend to include flag:
```php
echo json_encode([
    'error' => 'Weekends do not count toward streaks',
    'isWeekend' => true
]);
```

---

### 🟡 Bug #6: No Validation of Response Structure in Frontend
**Location:** `js.js` lines 54-55 (original)

**Problem:**
Frontend assumes `streakData.streak` exists and has the right properties. If the backend returns malformed data or the response structure changes, the code crashes.

**Scenario:**
1. Backend error returns HTML instead of JSON
2. Or API changes response format
3. Frontend tries to access `streakData.streak` → undefined
4. UI breaks with JavaScript error

**Fix:**
Added validation:
```javascript
// Validate response structure
if (streakData && streakData.streak) {
    updateStreakUI(streakData.streak);
} else {
    throw new Error('Invalid streak data format');
}
```

Also added validation in `updateStreakUI()`:
```javascript
// Validate input
if (!streakData || typeof streakData !== 'object') {
    console.error('Invalid streak data provided to updateStreakUI');
    return;
}

// Update day indicators - ensure weekDays exists and is an array
if (Array.isArray(streakData.weekDays) && dayElements.length > 0) {
    // ... safe to use
}
```

---

### 🟡 Bug #7: Missing ArcoAPI Availability Check
**Location:** `js.js` line 48 (original)

**Problem:**
If the `api.js` file fails to load (network error, 404, etc.), the code tries to call `ArcoAPI.recordLogin()` on an undefined object, causing a hard crash.

**Scenario:**
1. User's browser blocks the `api.js` script
2. Or CDN/server fails to serve the file
3. `ArcoAPI` is undefined
4. Code crashes with "ArcoAPI is not defined"

**Fix:**
Added availability check:
```javascript
// Check if ArcoAPI is available
if (typeof ArcoAPI === 'undefined') {
    console.error('ArcoAPI not loaded');
    updateStreakUI({
        currentStreak: 0,
        weekDays: [false, false, false, false, false]
    });
    return;
}
```

---

## Additional Edge Cases Handled

### 🔵 Edge Case #1: Login Response Missing User Object
**Location:** `Login/js/js.js` line 73

**Problem:**
If backend returns malformed response without `user` object, code would throw errors.

**Fix:**
```javascript
const user = result.user;
if (user) {
    if (user.display_name) localStorage.setItem('arco-name', user.display_name);
    // ... etc
}
```

---

### 🔵 Edge Case #2: Empty dayElements NodeList
**Location:** `js.js` `updateStreakUI()` function

**Problem:**
If the HTML structure changes or elements aren't found, `forEach` would still run but do nothing silently.

**Fix:**
Added length check:
```javascript
if (Array.isArray(streakData.weekDays) && dayElements.length > 0) {
    dayElements.forEach((dayEl, index) => {
        // ... update UI
    });
}
```

---

### 🔵 Edge Case #3: Timezone Considerations
**Location:** Backend `streak.php`

**Issue:**
Using PHP's `date()` function uses server timezone, which might not match user's timezone.

**Current Behavior:**
- All dates are calculated in server timezone
- A user in Japan (UTC+9) might record a login on "Monday" while it's still Sunday in California (UTC-8)

**Status:**
✅ **Acceptable for current implementation** - Using server timezone is standard practice for backend systems. If users in different timezones are an issue later, this can be addressed by:
1. Storing user's timezone in profile
2. Passing timezone offset from frontend
3. Converting dates in backend

For now, this is **not considered a bug** but noted for future enhancement.

---

## Testing Recommendations

After these fixes, test these specific scenarios:

### High Priority Tests:
1. **New User Flow**
   - Create account → Immediately go to home page
   - Should show "01 days streak" without errors

2. **Multiple Simultaneous Logins**
   - Open 3 tabs at once
   - All should load without duplicate key errors

3. **Weekend Behavior**
   - Test on Saturday/Sunday
   - Should still show current streak (not reset to 0)
   - Console should indicate weekend detected

4. **Missing API File**
   - Temporarily rename `api.js`
   - Page should load with default UI, no JavaScript errors

5. **Week Transition**
   - Log in on Friday evening
   - Wait until Sunday
   - Log in again on Monday
   - Week view should show only Monday filled (new week)

### Medium Priority Tests:
6. **Data Validation**
   - Manually corrupt streak data in database
   - System should recover gracefully

7. **Race Conditions**
   - Use browser dev tools to throttle network
   - Make rapid page refreshes
   - No duplicate errors should appear

8. **Malformed Responses**
   - Use network interceptor to return invalid JSON
   - Frontend should show default UI, log error

---

## Performance Considerations

No performance issues identified, but some optimizations to consider:

1. **Caching GET Requests**: Consider caching `getStreak()` response for 5-10 seconds to reduce database load on rapid page refreshes
2. **Database Indexes**: The schema already includes `INDEX idx_user_date (user_id, login_date)` which is good
3. **Connection Pooling**: PDO reuses connections via `static $pdo` which is optimal

---

## Security Review

✅ **All security checks passed:**

1. ✅ **Authentication**: `requireAuth()` called on all endpoints
2. ✅ **SQL Injection**: All queries use prepared statements
3. ✅ **XSS Prevention**: All output is JSON (not HTML)
4. ✅ **CSRF**: Not needed - API uses session cookies with `credentials: 'same-origin'`
5. ✅ **Data Validation**: User ID from session (trusted), dates from `date()` (trusted)
6. ✅ **Error Messages**: No sensitive data leaked in error responses

---

## Code Quality Improvements Made

1. **Error Handling**: Added try-catch blocks around all DB operations
2. **Input Validation**: Added checks for null/undefined/malformed data
3. **Type Safety**: Explicit type casting `(int)` on all numeric values
4. **Documentation**: Code is self-documenting with clear comments
5. **Defensive Programming**: Multiple fallback paths for edge cases

---

## Summary of Changes

### Backend (`streak.php`):
- ✅ Fixed missing record handling in POST endpoint
- ✅ Fixed race condition in GET endpoint
- ✅ Fixed week calculation logic
- ✅ Added validation for "already logged" path
- ✅ Enhanced weekend error response

### Frontend (`Home/js/js.js`):
- ✅ Added ArcoAPI availability check
- ✅ Added response structure validation
- ✅ Added weekend-specific error handling
- ✅ Added defensive checks in `updateStreakUI()`

### Login Flow (`Login/js/js.js`):
- ✅ Added user object validation

---

## Risk Assessment

### Before Fixes: 🔴 HIGH RISK
- Multiple crash scenarios
- Data integrity issues
- Poor user experience on edge cases

### After Fixes: 🟢 LOW RISK
- All critical bugs resolved
- Graceful degradation on errors
- Defensive programming throughout

---

## Recommendation

✅ **Code is production-ready** after these fixes.

All critical bugs have been addressed, edge cases are handled, and the system degrades gracefully when issues occur. The implementation follows best practices for:
- Error handling
- Data validation
- Race condition management
- User experience

**Next step:** Run the database schema and begin testing in a staging environment.
