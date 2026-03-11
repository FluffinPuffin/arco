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
    .catch(err => console.error("Frame load failed:", err));
});

function goBack() {
  window.history.back();
}

// On frame ready, sync profile data from server (if logged in)
document.addEventListener("frame:ready", () => {
  if (typeof ArcoAPI !== 'undefined') {
    ArcoAPI.syncFromServer();
  }
});

// Logout overlay functionality
document.addEventListener("frame:ready", () => {
  const profileIcon = document.querySelector(".profile-icon");
  const logoutOverlay = document.getElementById("logoutOverlay");

  // Load profile data from localStorage
  const savedAvatar = localStorage.getItem("arco-avatar");
  const savedName = localStorage.getItem("arco-name");
  const savedGrade = localStorage.getItem("arco-grade");

  // Update header profile icon
  if (savedAvatar && profileIcon) {
    profileIcon.src = savedAvatar.startsWith("/") ? savedAvatar : "/" + savedAvatar;
  }

  // Update logout overlay
  const logoutAvatar = document.querySelector(".logout-avatar");
  const logoutName = document.querySelector(".logout-name");
  const logoutGrade = document.querySelector(".logout-grade");

  if (savedAvatar && logoutAvatar) {
    logoutAvatar.src = savedAvatar.startsWith("/") ? savedAvatar : "/" + savedAvatar;
  }
  if (savedName && logoutName) {
    logoutName.textContent = savedName;
  }
  if (savedGrade && logoutGrade) {
    logoutGrade.textContent = "Grade Level : " + savedGrade;
  }

  if (profileIcon && logoutOverlay) {
    // Toggle logout overlay when clicking profile icon
    profileIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      logoutOverlay.classList.toggle("hidden");
    });

    // Close overlay when clicking outside
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
