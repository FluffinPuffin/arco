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

// Logout overlay functionality
document.addEventListener("frame:ready", () => {
  const profileIcon = document.querySelector(".profile-icon");
  const logoutOverlay = document.getElementById("logoutOverlay");

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
  // Redirect to login/landing page
  window.location.href = window.location.origin + "/Login/html/index.html";
}
