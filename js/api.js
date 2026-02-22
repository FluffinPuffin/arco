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
      const err = new Error(data.error || 'Request failed');
      err.status = res.status;
      throw err;
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

  // QR Code system
  validateQrKey(token) {
    return this._fetch('/api/qr.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'validate_key', token }),
    });
  },

  unlockStickerByQr(lessonId, stickerId) {
    return this._fetch('/api/qr.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'unlock_sticker', lesson_id: lessonId, sticker_id: stickerId }),
    });
  },

  getQrStatus() {
    return this._fetch('/api/qr.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'get_qr_status' }),
    });
  },

  // Load user profile data from server into localStorage (called after login or on page load)
  async syncFromServer() {
    try {
      const profileRes = await this.getProfile();
      const user = profileRes.user;

      if (user.display_name) localStorage.setItem('arco-name', user.display_name);
      if (user.avatar) localStorage.setItem('arco-avatar', user.avatar);
      if (user.grade) localStorage.setItem('arco-grade', user.grade);

      return true;
    } catch {
      // Not logged in or server unreachable — that's ok
      return false;
    }
  },
};
