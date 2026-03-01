document.addEventListener("frame:ready", () => {
    // Load title into the frame's title placeholder
    const titleContainer = document.getElementById('lesson-title');
    if (titleContainer) {
        fetch("./title.html")
            .then(res => {
                if (!res.ok) throw new Error("Failed to load title.html");
                return res.text();
            })
            .then(titleContent => {
                titleContainer.innerHTML = titleContent;
            })
            .catch(err => console.error("Title load failed:", err));
    }

    // Load content
    fetch("./content.html")
        .then(res => {
            if (!res.ok) throw new Error("Failed to load content");
            return res.text();
        })
        .then(content => {
            document.getElementById("content").insertAdjacentHTML("beforeend", content);

            // Add hover effects to swap images
            const buttons = document.querySelectorAll('.btn img');
            buttons.forEach(img => {
                const originalSrc = img.src;
                const hoverSrc = originalSrc.replace('.svg', '-hover.svg');

                img.parentElement.addEventListener('mouseenter', () => {
                    img.src = hoverSrc;
                });

                img.parentElement.addEventListener('mouseleave', () => {
                    img.src = originalSrc;
                });
            });

            // Initialize streak tracker
            initializeStreakTracker();
        })
        .catch(err => console.error("Content load failed:", err));
})

// Streak Tracker Functionality with Client-Side Caching
const streakCache = {
    data: null,
    timestamp: 0,
    ttl: 5000,
    pendingRequest: null,
    errorTimestamp: 0,
    errorBackoff: 5000
};

async function getCachedStreak() {
    const now = Date.now();
    
    // Check if we're in error backoff period
    if (streakCache.errorTimestamp && 
        (now - streakCache.errorTimestamp) < streakCache.errorBackoff) {
        if (streakCache.data) {
            return streakCache.data;
        }
        throw new Error('API unavailable, in backoff period');
    }
    
    // Check if cache is valid
    if (streakCache.data && (now - streakCache.timestamp) < streakCache.ttl) {
        return streakCache.data;
    }
    
    // If request is already in flight, wait for it (prevent race condition)
    if (streakCache.pendingRequest) {
        return streakCache.pendingRequest;
    }
    
    // Start new request
    streakCache.pendingRequest = (async () => {
        try {
            const streakData = await ArcoAPI.getStreak();
            
            // Validate response structure before caching
            if (!streakData || !streakData.success || !streakData.streak || 
                !Array.isArray(streakData.streak.weekDays) ||
                typeof streakData.streak.currentStreak !== 'number') {
                throw new Error('Invalid streak data structure');
            }
            
            // Update cache with valid data
            streakCache.data = streakData;
            streakCache.timestamp = Date.now();
            streakCache.errorTimestamp = 0;
            
            return streakData;
        } catch (error) {
            // Set error backoff
            streakCache.errorTimestamp = Date.now();
            
            // If we have stale cache, return it as fallback
            if (streakCache.data) {
                console.warn('API error, returning stale cache:', error.message);
                return streakCache.data;
            }
            
            throw error;
        } finally {
            streakCache.pendingRequest = null;
        }
    })();
    
    return streakCache.pendingRequest;
}

function invalidateStreakCache() {
    streakCache.data = null;
    streakCache.timestamp = 0;
    streakCache.pendingRequest = null;
    streakCache.errorTimestamp = 0;
}

async function initializeStreakTracker() {
    try {
        // Check if ArcoAPI is available
        if (typeof ArcoAPI === 'undefined') {
            console.error('ArcoAPI not loaded');
            updateStreakUI({
                currentStreak: 0,
                weekDays: [false, false, false, false, false]
            });
            return;
        }

        // Call backend to record login and get updated streak
        const response = await ArcoAPI.recordLogin();
        
        if (response.success) {
            // Invalidate cache if login was recorded (new data available)
            if (!response.alreadyRecorded) {
                invalidateStreakCache();
            }
            
            // Fetch the full week data (will use cache if available)
            const streakData = await getCachedStreak();
            
            // Validate response structure
            if (streakData && streakData.streak) {
                updateStreakUI(streakData.streak);
            } else {
                throw new Error('Invalid streak data format');
            }
        }
    } catch (err) {
        console.error('Failed to load streak data:', err);
        
        // Check if it's a weekend error
        if (err.status === 400 || (err.message && err.message.includes('weekend'))) {
            console.log('Weekend detected - streaks do not count');
            // Still try to fetch current streak data (will use cache if available)
            try {
                const streakData = await getCachedStreak();
                if (streakData && streakData.streak) {
                    updateStreakUI(streakData.streak);
                    return;
                }
            } catch (fetchErr) {
                console.error('Failed to fetch streak on weekend:', fetchErr);
            }
        }
        
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
    
    // Validate input
    if (!streakData || typeof streakData !== 'object') {
        console.error('Invalid streak data provided to updateStreakUI');
        return;
    }
    
    // Update day indicators - ensure weekDays exists and is an array
    if (Array.isArray(streakData.weekDays) && dayElements.length > 0) {
        dayElements.forEach((dayEl, index) => {
            if (index < streakData.weekDays.length && streakData.weekDays[index]) {
                dayEl.classList.add('filled');
            } else {
                dayEl.classList.remove('filled');
            }
        });
    }
    
    // Update streak count
    if (streakCountElement) {
        const count = streakData.currentStreak || 0;
        const plural = count === 1 ? 'day' : 'days';
        streakCountElement.textContent = `${count.toString().padStart(2, '0')} ${plural} streak`;
    }
}