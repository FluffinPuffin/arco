// Arco API helper — provides functions to communicate with the PHP backend.
// Include this script on any page that needs server sync.

const ArcoAPI = {
  async _fetch(url, options = {}) {
    const res = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  },

  // Auth
  register(email, password, displayName, avatar, grade) {
    return this._fetch('/api/register.php', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName, avatar, grade }),
    });
  },

  login(email, password) {
    return this._fetch('/api/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout() {
    return this._fetch('/api/logout.php', { method: 'POST' });
  },

  // Profile
  getProfile() {
    return this._fetch('/api/profile.php');
  },

  updateProfile(fields) {
    return this._fetch('/api/profile.php', {
      method: 'POST',
      body: JSON.stringify(fields),
    });
  },

  // Progress
  getProgress() {
    return this._fetch('/api/progress.php');
  },

  saveProgress(lessonId, partCompleted, currentPartIndex, percentage, completed) {
    return this._fetch('/api/progress.php', {
      method: 'POST',
      body: JSON.stringify({
        lesson_id: lessonId,
        part_completed: partCompleted,
        current_part_index: currentPartIndex,
        percentage,
        completed,
      }),
    });
  },

  // Load user data from server into localStorage (called after login or on page load)
  async syncFromServer() {
    try {
      const profileRes = await this.getProfile();
      const user = profileRes.user;

      if (user.display_name) localStorage.setItem('arco-name', user.display_name);
      if (user.avatar) localStorage.setItem('arco-avatar', user.avatar);
      if (user.grade) localStorage.setItem('arco-grade', user.grade);

      const progressRes = await this.getProgress();
      const progress = progressRes.progress;

      // Build aggregate progress for the lessons page
      const aggregate = {};
      for (const [lessonId, data] of Object.entries(progress)) {
        // Store individual lesson progress
        localStorage.setItem(`arco_progress_${lessonId}`, JSON.stringify({
          partCompleted: data.partCompleted,
          currentPartIndex: data.currentPartIndex,
          lastUpdated: Date.now(),
        }));

        const completedCount = (data.partCompleted || []).filter(Boolean).length;
        const totalParts = (data.partCompleted || []).length;
        aggregate[lessonId] = {
          percentage: data.percentage,
          completedParts: completedCount,
          totalParts: totalParts,
          completed: data.completed,
        };
      }
      localStorage.setItem('arco_lessons_progress', JSON.stringify(aggregate));

      return true;
    } catch {
      // Not logged in or server unreachable — that's ok
      return false;
    }
  },
};
