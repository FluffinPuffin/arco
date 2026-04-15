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
      console.log("Fetch response:", res);
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then(content => {
      document
        .getElementById("content")
        .insertAdjacentHTML("beforeend", content);
      loadGamePremium();
    })
    .catch(err => console.error("CONTENT LOAD FAILED:", err));
});

async function loadGamePremium() {
  let isPremium = false;
  try {
    if (typeof ArcoAPI !== 'undefined') {
      const res = await ArcoAPI.getProgress();
      isPremium = res.is_premium || false;
    }
  } catch (e) {
    // Not logged in or server unavailable — treat as non-premium
  }
  applyPremiumLocking(isPremium);
}

function applyPremiumLocking(isPremium) {
  if (isPremium) return;

  const gameCards = document.querySelectorAll('.game-card');
  gameCards.forEach(card => {
    if (card.dataset.game !== 'matchemUp') {
      card.classList.add('premium-locked');

      // Remove the play button so the card doesn't navigate anywhere
      const cardBtn = card.querySelector('.card-btn');
      if (cardBtn) cardBtn.remove();

      // Inject premium overlay
      const overlay = document.createElement('div');
      overlay.className = 'premium-overlay';
      overlay.innerHTML = `
        <img class="overlay-diamond" src="../../frame/images/diamondIcon.svg" alt="Premium">
        <span class="overlay-text">Premium Club</span>
      `;
      card.appendChild(overlay);
    }
  });
}
