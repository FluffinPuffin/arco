document.addEventListener("frame:ready", () => {
  // Inject title.html before the rectangle
  const container = document.querySelector('.container');
  if (container) {
    fetch("../html/title.html")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load title.html");
        return res.text();
      })
      .then(titleContent => {
        container.insertAdjacentHTML("beforebegin", titleContent);
      })
      .catch(err => console.error("TITLE LOAD FAILED:", err));
  } else {
    console.warn("container element not found");
  }

  // Then load content.html normally
  fetch("../html/content.html")
    .then(res => {
      console.log("Fetch response:", res);
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then(content => {
      document
        .getElementById("content")
        .insertAdjacentHTML("beforeend", content);
      initLessonParts();
      initVideoControls();
    })
    .catch(err => console.error("CONTENT LOAD FAILED:", err));
});



function initVideoControls() {
  const video = document.querySelector('.lesson-video');
  const sizeBtn = document.querySelector('#sizeBtn');

  if (!sizeBtn) {
    console.warn("Video controls not found");
    return;
  }

  let isPlaying = false;
  let isBig = false;

  sizeBtn.addEventListener('click', () => {
    if (!isBig) {
      video.style.width = '640px';
      video.style.height = '480px';
      sizeBtn.textContent = 'Smaller';
    } else {
      video.style.width = '320px';
      video.style.height = '240px';
      sizeBtn.textContent = 'Bigger';
    }
    isBig = !isBig;
  });
}

function initLessonParts() {
  const parts = document.querySelectorAll('.lesson-content > div');
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');

  if (!parts.length || !nextBtn || !backBtn) {
    console.warn("Lesson parts or navigation buttons not found");
    return;
  }

  let current = 0;

  function showPart(index, push = true) {
    parts.forEach(p => p.classList.remove('active'));
    parts[index].classList.add('active');

    current = index;

    if (push) {
      history.pushState(
        { lessonIndex: index },
        "",
        `#lesson-${index + 1}`
      );
    }

    // Hide back button on first part, hide next button on last part
    backBtn.style.display = index <= 0 ? "none" : "block";
    nextBtn.style.display = index >= parts.length - 1 ? "none" : "block";
  }

  // Show the first part initially
  showPart(0, false);

  // Handle back button click
  backBtn.addEventListener('click', () => {
    if (current > 0) {
      showPart(current - 1);
    }
  });

  // Handle next button click
  nextBtn.addEventListener('click', () => {
    if (current < parts.length - 1) {
      showPart(current + 1);
    }
  });
}


