// Track which parts have been completed
const partCompleted = [false, false, false, false, false];
let currentPartIndex = 0;

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
        // Hide all titles except the first one
        initTitles();
      })
      .catch(err => console.error("TITLE LOAD FAILED:", err));
  } else {
    console.warn("lesson-title element not found");
  }

  // Then load content.html normally
  fetch("../html/content.html")
    .then(res => {
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then(content => {
      const contentEl = document.getElementById("content");
      contentEl.insertAdjacentHTML("beforeend", content);
      initLessonParts();
      initVideoControls();
      initInfoTabs();
      initButtonStates();
      initQuiz();
      initFinishButtons();
    })
    .catch(err => console.error("CONTENT LOAD FAILED:", err));
});

function initTitles() {
  const titles = document.querySelectorAll('.title-wrapper');
  titles.forEach((title, index) => {
    if (index === 0) {
      title.style.display = 'block';
    } else {
      title.style.display = 'none';
    }
  });
}

function showTitle(index) {
  const titles = document.querySelectorAll('.title-wrapper');
  titles.forEach((title, i) => {
    title.style.display = i === index ? 'block' : 'none';
  });
}

function initVideoControls() {
  const videoContainers = document.querySelectorAll('.video-recap-container');

  videoContainers.forEach((container, index) => {
    const video = container.querySelector('.lesson-video');
    const playBtn = container.querySelector('.play-btn');
    const sizeBtn = container.querySelector('.size-btn, #sizeBtn');

    if (!video) return;

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        video.play();
        playBtn.classList.add('hidden');
        video.setAttribute('controls', 'controls');
      });

      video.addEventListener('pause', () => {
        if (!video.ended) {
          playBtn.classList.remove('hidden');
        }
      });

      video.addEventListener('play', () => {
        playBtn.classList.add('hidden');
      });
    }

    video.addEventListener('ended', () => {
      markPartCompleted(index);
      if (playBtn) {
        playBtn.classList.remove('hidden');
        video.removeAttribute('controls');
      }
    });

    if (!sizeBtn) return;

    let isBig = false;

    sizeBtn.addEventListener('click', () => {
      if (!isBig) {
        video.style.width = '100%';
        sizeBtn.src = '../../images/shrink.svg';
        sizeBtn.alt = 'Shrink Video';
        container.classList.add('expanded');
      } else {
        video.style.width = '';
        sizeBtn.src = '../../images/enlarge.svg';
        sizeBtn.alt = 'Enlarge Video';
        container.classList.remove('expanded');
      }
      isBig = !isBig;
    });
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
    currentPartIndex = index;

    showTitle(index);
    updateButtonStates();

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

  showPart(0, false);

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const partIndex = parseInt(btn.dataset.part, 10);

      if (btn.classList.contains('locked')) {
        return;
      }

      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 150);

      showPart(partIndex);
    });
  });
}

function initButtonStates() {
  updateButtonStates();
}

function updateButtonStates() {
  const navBtns = document.querySelectorAll('.part-nav .nav-btn');

  navBtns.forEach((btn, index) => {
    btn.classList.remove('locked', 'active', 'completed');

    if (index === currentPartIndex) {
      btn.classList.add('active');
    } else if (index < currentPartIndex || partCompleted[index]) {
      btn.classList.add('completed');
    } else if (index === currentPartIndex + 1 && partCompleted[currentPartIndex]) {
      // Next button is accessible
    } else if (index > currentPartIndex) {
      btn.classList.add('locked');
    }
  });
}

function markPartCompleted(partIndex) {
  partCompleted[partIndex] = true;
  updateButtonStates();
}

function initInfoTabs() {
  const infoBoxes = document.querySelectorAll('.info-box');

  infoBoxes.forEach(box => {
    const tabs = box.querySelectorAll('.info-tab');
    const panels = box.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

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

function initQuiz() {
  const quiz = document.querySelector('.quiz');
  if (!quiz) return;

  const questions = quiz.querySelectorAll('.quiz-question');
  const result = quiz.querySelector('.quiz-result');
  const scoreDisplay = quiz.querySelector('.quiz-score');
  const retryBtn = quiz.querySelector('.quiz-retry');
  const continueBtn = quiz.querySelector('.quiz-continue');

  let currentQuestion = 1;
  let score = 0;
  const totalQuestions = questions.length;

  questions.forEach(question => {
    const options = question.querySelectorAll('.quiz-option');
    const correctAnswer = question.dataset.answer;

    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(opt => opt.disabled = true);

        const selectedAnswer = option.dataset.option;
        if (selectedAnswer === correctAnswer) {
          option.classList.add('correct');
          score++;
        } else {
          option.classList.add('incorrect');
          options.forEach(opt => {
            if (opt.dataset.option === correctAnswer) {
              opt.classList.add('correct');
            }
          });
        }

        setTimeout(() => {
          if (currentQuestion < totalQuestions) {
            question.style.display = 'none';
            currentQuestion++;
            const nextQuestion = quiz.querySelector(`[data-question="${currentQuestion}"]`);
            if (nextQuestion) {
              nextQuestion.style.display = 'block';
            }
          } else {
            question.style.display = 'none';
            result.style.display = 'block';
            scoreDisplay.textContent = `You got ${score} out of ${totalQuestions} correct!`;
            markPartCompleted(2);
          }
        }, 1000);
      });
    });
  });

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      currentQuestion = 1;
      score = 0;
      result.style.display = 'none';

      questions.forEach((question, index) => {
        const options = question.querySelectorAll('.quiz-option');
        options.forEach(opt => {
          opt.disabled = false;
          opt.classList.remove('correct', 'incorrect');
        });
        question.style.display = index === 0 ? 'block' : 'none';
      });
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const navBtns = document.querySelectorAll('.part-nav .nav-btn');
      const nextBtn = navBtns[2];
      if (nextBtn && !nextBtn.classList.contains('locked')) {
        nextBtn.click();
      }
    });
  }
}

function initFinishButtons() {
  const exitBtn = document.querySelector('.btn-exit');
  const nextLessonBtn = document.querySelector('.btn-next-lesson');

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      window.location.href = '../../html/index.html';
    });
  }

  if (nextLessonBtn) {
    nextLessonBtn.addEventListener('click', () => {
      window.location.href = '../../lesson3-3/html/index.html';
    });
  }
}

// Dev testing functions
function devGoToFinish() {
  for (let i = 0; i < partCompleted.length; i++) {
    partCompleted[i] = true;
  }
  updateButtonStates();

  const navBtns = document.querySelectorAll('.part-nav .nav-btn');
  if (navBtns[4]) {
    navBtns[4].click();
  }
}

function devGoToPart(partIndex) {
  for (let i = 0; i < partIndex; i++) {
    partCompleted[i] = true;
  }
  updateButtonStates();

  const navBtns = document.querySelectorAll('.part-nav .nav-btn');
  if (navBtns[partIndex]) {
    navBtns[partIndex].click();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    devGoToFinish();
  }
});

window.devGoToFinish = devGoToFinish;
window.devGoToPart = devGoToPart;
