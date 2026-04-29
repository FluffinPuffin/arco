// Load the shared API helper
(function () {
  const scriptSrc = document.currentScript.src;
  const frameDir = scriptSrc.substring(0, scriptSrc.lastIndexOf('/js/'));
  const s = document.createElement('script');
  s.src = frameDir + '/../Home/js/api.js';
  document.head.appendChild(s);
})();

// Get the base path to the frame folder from this script's location
const scriptSrc = document.currentScript.src;
const framePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/js/'));

// Load the orientation overlay guard
const orientScript = document.createElement('script');
orientScript.src = framePath + '/js/orientation.js';
document.head.appendChild(orientScript);

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

      // Set active footer link based on current page
      const path = window.location.pathname || "";
      document.querySelectorAll(".footer-link[data-footer]").forEach((link) => {
        const key = link.dataset.footer;
        const isActive =
          (key === "faq" && path.includes("/Footer/FAQ/")) ||
          (key === "legal" && path.includes("/Footer/Legalpolicies/")) ||
          (key === "contact" && path.includes("/Footer/Contactus/"));
        link.classList.toggle("footer-active", isActive);
      });

      document.dispatchEvent(new Event("frame:ready"));
    })
    .catch(() => {});
});

function goBack() {
  window.history.back();
}

// Logout overlay functionality
document.addEventListener("frame:ready", async () => {
  const profileIcon   = document.querySelector(".profile-icon");
  const logoutAvatar  = document.querySelector(".logout-avatar");
  const logoutName    = document.querySelector(".logout-name");
  const logoutGrade   = document.querySelector(".logout-grade");
  const logoutOverlay = document.getElementById("logoutOverlay");

  try {
    const res  = await fetch('/api/profile.php', { credentials: 'include' });
    const data = await res.json();
    if (data?.success) {
      const { avatar, display_name, grade } = data.user;
      const src = avatar ? (avatar.startsWith('/') ? avatar : '/' + avatar) : null;
      if (src && profileIcon)  profileIcon.src  = src;
      if (src && logoutAvatar) logoutAvatar.src = src;
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
});

function signOut() {
  // Call backend logout, then redirect to login page
  if (typeof ArcoAPI !== 'undefined') {
    ArcoAPI.logout().finally(() => {
      window.location.href = window.location.origin + "/Login/html/index.html";
    });
  } else {
    window.location.href = window.location.origin + "/Login/html/index.html";
  }
}
