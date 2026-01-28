document.addEventListener("frame:ready", () => {
  // Inject title.html before the rectangle
  const container = document.querySelector('.container'); // or '#container' if it's an ID
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

document.addEventListener('DOMContentLoaded', () => {
    const parts = document.querySelectorAll('.lesson-content > div');
    const nextBtn = document.getElementById('nextBtn');
    let current = 0;

    // Show the first part
    parts[current].classList.add('active');

    nextBtn.addEventListener('click', () => {
        parts[current].classList.remove('active');
        current++;

        if (current >= parts.length) {
            nextBtn.style.display = 'none';
            return;
        }

        parts[current].classList.add('active');
    });
});

