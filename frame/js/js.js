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

      // Apply saved avatar to frame header
      const savedAvatar = localStorage.getItem("arco-avatar");
      const profileIcon = document.querySelector(".profile-icon");
      if (savedAvatar && profileIcon) {
        profileIcon.src = savedAvatar.startsWith("/") ? savedAvatar : "/" + savedAvatar;
      }

      document.dispatchEvent(new Event("frame:ready"));
    })
    .catch(err => console.error("Frame load failed:", err));
});

function goBack() {
  window.history.back();
}
