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
      initCarousels();
    })
    .catch(err => console.error("Content load failed:", err));
});

function initCarousels() {
  const sections = document.querySelectorAll(".lesson-section");

  sections.forEach(section => {
    const track = section.querySelector(".lessons-track");
    const prevBtn = section.querySelector(".nav-arrow.prev");
    const nextBtn = section.querySelector(".nav-arrow.next");

    if (!track || !prevBtn || !nextBtn) return;

    const scrollAmount = 200;

    function updateButtons() {
      const isAtStart = track.scrollLeft <= 0;
      const isAtEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 10;
      prevBtn.disabled = isAtStart;
      nextBtn.disabled = isAtEnd;
    }

    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newPos = Math.max(0, track.scrollLeft - scrollAmount);
      track.scrollTo({ left: newPos, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const maxScroll = track.scrollWidth - track.clientWidth;
      const newPos = Math.min(maxScroll, track.scrollLeft + scrollAmount);
      track.scrollTo({ left: newPos, behavior: "smooth" });
    });

    track.addEventListener("scroll", updateButtons);
    setTimeout(updateButtons, 100);
  });

  const premiumCards = document.querySelectorAll(".lesson-card.premium-locked");
  premiumCards.forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Premium content - upgrade required");
    });
  });
}
