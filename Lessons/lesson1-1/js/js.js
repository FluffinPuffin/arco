document.addEventListener("frame:ready", () => {
  // Inject title.html into the frame's title placeholder
  const titleContainer = document.getElementById('lesson-title');
  if (titleContainer) {
    fetch("../html/title.html")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load title.html");
        return res.text();
      })
      .then(titleContent => {
        titleContainer.innerHTML = titleContent;
      })
      .catch(err => console.error("TITLE LOAD FAILED:", err));
  } else {
    console.warn("lesson-title element not found");
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
      initInfoTabs();
    })
    .catch(err => console.error("CONTENT LOAD FAILED:", err));
});



function initVideoControls() {
  const video = document.querySelector('.lesson-video');
  const sizeBtn = document.querySelector('#sizeBtn');
  const container = document.querySelector('.video-recap-container');

  if (!sizeBtn) {
    console.warn("Video controls not found");
    return;
  }

  let isPlaying = false;
  let isBig = false;

  sizeBtn.addEventListener('click', () => {
    if (!isBig) {
      video.style.width = '640px';
      sizeBtn.src = '../../images/shrink.svg';
      sizeBtn.alt = 'Shrink Video';
      container.classList.add('expanded');
    } else {
      video.style.width = '320px';
      sizeBtn.src = '../../images/enlarge.svg';
      sizeBtn.alt = 'Enlarge Video';
      container.classList.remove('expanded');
    }
    isBig = !isBig;
  });
}

function initLessonParts() {
  const parts = document.querySelectorAll('.lesson-content > div[id^="part"]');
  const partNav = document.querySelector('.part-nav');
  const navBtns = document.querySelectorAll('.part-nav .nav-btn');

  if (!parts.length || !navBtns.length) {
    console.warn("Lesson parts or navigation buttons not found");
    return;
  }

  function showPart(index, push = true) {
    parts.forEach(p => p.classList.remove('active'));
    parts[index].classList.add('active');

    // Move part-nav into the active part, after video area and before info-box
    const activePart = parts[index];
    const infoBox = activePart.querySelector('.info-box');
    if (infoBox) {
      activePart.insertBefore(partNav, infoBox);
    } else {
      activePart.appendChild(partNav);
    }

    if (push) {
      history.pushState(
        { lessonIndex: index },
        "",
        `#lesson-${index + 1}`
      );
    }
  }

  // Show the first part initially
  showPart(0, false);

  // Handle nav button clicks
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const partIndex = parseInt(btn.dataset.part, 10);
      showPart(partIndex);
    });
  });
}

function initInfoTabs() {
  const infoBoxes = document.querySelectorAll('.info-box');

  infoBoxes.forEach(box => {
    const tabs = box.querySelectorAll('.info-tab');
    const panels = box.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active panel
        panels.forEach(panel => {
          if (panel.dataset.panel === targetTab) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  });
}
