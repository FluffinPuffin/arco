// ---- Time Tracking ----
(function () {
  let sessionStart = Date.now();
  let pendingSeconds = 0;

  function flush() {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    sessionStart = Date.now();
    if (elapsed <= 0) return;
    pendingSeconds += elapsed;
    const toSend = pendingSeconds;
    pendingSeconds = 0;
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/time_tracking.php", JSON.stringify({ seconds: toSend }));
    } else {
      fetch("/api/time_tracking.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds: toSend }),
        keepalive: true,
      }).catch(() => {});
    }
  }

  setInterval(flush, 60000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) flush();
    else sessionStart = Date.now();
  });
  window.addEventListener("beforeunload", flush);
})();

// Get the base path to the frame folder from this script's location
const scriptSrc = document.currentScript.src;
const framePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/js/'));

document.addEventListener("DOMContentLoaded", () => {
    fetch(framePath + "/html/index.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.text();
        })
        .then(html => {
            // Replace placeholder paths with actual paths
            html = html.replace(/\{\{FRAME_PATH\}\}/g, framePath);
            document.body.insertAdjacentHTML("afterbegin", html);

            document.dispatchEvent(new Event("frame:ready"));
            toggleLogoutOverlay();
        })
        .catch(() => {});
});

async function toggleLogoutOverlay() {
    const profileIcon   = document.querySelector(".profile-icon");
    const logoutAvatar  = document.querySelector(".logout-avatar");
    const logoutName    = document.querySelector(".logout-name");
    const logoutGrade   = document.querySelector(".logout-grade");
    const logoutOverlay = document.getElementById("logoutOverlay");

    // Apply cached avatar immediately to prevent flicker
    const cachedSrc = localStorage.getItem('arco_avatar');
    if (cachedSrc && profileIcon)  profileIcon.src  = cachedSrc;
    if (cachedSrc && logoutAvatar) logoutAvatar.src = cachedSrc;

    try {
        const res  = await fetch('/api/profile.php', { credentials: 'include' });
        const data = await res.json();
        if (data?.success) {
            const { avatar, display_name, grade } = data.user;
            const src = avatar ? (avatar.startsWith('/') ? avatar : '/' + avatar) : null;
            if (src) {
                if (profileIcon)  profileIcon.src  = src;
                if (logoutAvatar) logoutAvatar.src = src;
                localStorage.setItem('arco_avatar', src);
            } else {
                localStorage.removeItem('arco_avatar');
            }
            if (display_name && logoutName)  logoutName.textContent  = display_name;
            if (grade        && logoutGrade) logoutGrade.textContent = 'Grade Level : ' + grade;
        }
    } catch { /* not logged in or server down — leave default placeholder */ }

    if (profileIcon && logoutOverlay) {
        profileIcon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            logoutOverlay.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!logoutOverlay.contains(e.target) && !profileIcon.contains(e.target)) {
                logoutOverlay.classList.add("hidden");
            }
        });
    }
}

function signOut() {
    // Redirect to login/landing page
    window.location.href = window.location.origin + "/Login/html/index.html";
}
