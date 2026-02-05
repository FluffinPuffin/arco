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
  }

  // Load content.html
  fetch("../html/content.html")
    .then(res => {
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then(content => {
      document
        .getElementById("content")
        .insertAdjacentHTML("beforeend", content);
      initInfoTabs();
      initGameControls();
      initGame();
    })
    .catch(err => console.error("CONTENT LOAD FAILED:", err));
});

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

function initGameControls() {
  const gameContainer = document.querySelector('.game-container');
  const sizeBtn = document.querySelector('.game-size-btn');

  if (!sizeBtn || !gameContainer) return;

  let isExpanded = false;

  sizeBtn.addEventListener('click', () => {
    if (!isExpanded) {
      sizeBtn.src = '../../images/shrink.svg';
      sizeBtn.alt = 'Shrink Game';
      gameContainer.classList.add('expanded');
    } else {
      sizeBtn.src = '../../images/enlarge.svg';
      sizeBtn.alt = 'Enlarge Game';
      gameContainer.classList.remove('expanded');
    }
    isExpanded = !isExpanded;
  });
}

function initGame() {
  const game = document.querySelector('.game');
  if (!game) return;

  const questions = game.querySelectorAll('.game-question');
  const result = game.querySelector('.game-result');
  const scoreDisplay = game.querySelector('.game-score');
  const retryBtn = game.querySelector('.game-retry');

  let currentQuestion = 1;
  let score = 0;
  const totalQuestions = questions.length;

  questions.forEach(question => {
    const options = question.querySelectorAll('.game-option');
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
        }

        setTimeout(() => {
          if (currentQuestion < totalQuestions) {
            question.style.display = 'none';
            currentQuestion++;
            const nextQuestion = game.querySelector(`[data-question="${currentQuestion}"]`);
            if (nextQuestion) {
              nextQuestion.style.display = 'block';
            }
          } else {
            question.style.display = 'none';
            result.style.display = 'block';
            scoreDisplay.textContent = `You got ${score} out of ${totalQuestions} correct!`;
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
        const options = question.querySelectorAll('.game-option');
        options.forEach(opt => {
          opt.disabled = false;
          opt.classList.remove('correct', 'incorrect');
        });
        question.style.display = index === 0 ? 'block' : 'none';
      });
    });
  }
}
