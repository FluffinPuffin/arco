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
      loadLessonProgress();
    })
    .catch(err => console.error("Content load failed:", err));
});

// Load and display lesson progress from server (localStorage fallback)
async function loadLessonProgress() {
  let allProgress;

  // Try server first, fall back to localStorage
  try {
    if (typeof ArcoAPI !== 'undefined') {
      const res = await ArcoAPI.getProgress();
      const serverProgress = res.progress;

      // Convert server format to the aggregate format the UI expects
      allProgress = {};
      for (const [lessonId, data] of Object.entries(serverProgress)) {
        const completedCount = (data.partCompleted || []).filter(Boolean).length;
        const totalParts = (data.partCompleted || []).length;
        allProgress[lessonId] = {
          percentage: data.percentage,
          completedParts: completedCount,
          totalParts: totalParts,
          completed: data.completed,
        };
      }

      // Update localStorage cache
      localStorage.setItem('arco_lessons_progress', JSON.stringify(allProgress));
    } else {
      throw new Error('ArcoAPI not available');
    }
  } catch (e) {
    // Fallback to localStorage
    allProgress = JSON.parse(localStorage.getItem('arco_lessons_progress') || '{}');
  }

  const lessonCards = document.querySelectorAll('.lesson-card');
  lessonCards.forEach(card => {
    const lessonId = card.dataset.lesson;
    const lessonKey = `lesson${lessonId}`;

    const progress = allProgress[lessonKey];
    if (progress) {
      const progressFill = card.querySelector('.progress-fill');
      const progressText = card.querySelector('.progress-text');
      const cardBtn = card.querySelector('.card-btn');

      if (progressFill) {
        progressFill.style.width = `${progress.percentage}%`;
      }
      if (progressText) {
        progressText.textContent = `${String(progress.percentage).padStart(2, '0')}%`;
      }

      // Update button text based on progress
      if (cardBtn) {
        if (progress.completed) {
          cardBtn.textContent = 'Review';
        } else if (progress.percentage > 0) {
          cardBtn.textContent = 'Continue';
        }
      }
    }
  });

  // Update section progress bars
  updateSectionProgress(allProgress);
}

// Update section header progress bars based on lesson completion
function updateSectionProgress(allProgress) {
  const sections = document.querySelectorAll('.lesson-section');

  sections.forEach(section => {
    const sectionNum = section.dataset.section;
    const progressBars = section.querySelectorAll('.progress-bar');
    const lessonCards = section.querySelectorAll('.lesson-card');

    let completedLessons = 0;
    lessonCards.forEach(card => {
      const lessonId = card.dataset.lesson;
      const lessonKey = `lesson${lessonId}`;
      if (allProgress[lessonKey] && allProgress[lessonKey].completed) {
        completedLessons++;
      }
    });

  });
}

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
