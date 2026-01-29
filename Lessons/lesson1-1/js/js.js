document.addEventListener("frame:ready", () => {
  // Inject title.html before the rectangle
  const container = document.querySelector('.container');
  if (container) {
    fetch("./title.html")
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

  if (!parts.length || !nextBtn) {
    console.warn("Lesson parts or next button not found");
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

    nextBtn.style.display = index >= parts.length - 1 ? "none" : "block";
  }
}


