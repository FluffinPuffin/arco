document.addEventListener("frame:ready", () => {
  // Inject title.html into the frame's title placeholder
  const titleContainer = document.getElementById("lesson-title");
  if (titleContainer) {
    fetch("./title.html")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load title.html");
        return res.text();
      })
      .then((titleContent) => {
        titleContainer.innerHTML = titleContent;
      })
      .catch((err) => console.error("TITLE LOAD FAILED:", err));
  }

  // Load content.html into #content, then init parental lock
  fetch("./content.html")
    .then((res) => {
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then((content) => {
      document.getElementById("content").insertAdjacentHTML("beforeend", content);
      initParentalLock();
    })
    .catch((err) => console.error("CONTENT LOAD FAILED:", err));
});

function initParentalLock() {
  const overlay = document.getElementById("parental-lock-overlay");
  const card = document.getElementById("premier-club-content");
  const boxes = Array.from(document.querySelectorAll(".pin-box"));
  const continueBtn = document.getElementById("parental-continue");
  const errorEl = document.getElementById("parental-error");

  if (!overlay || !boxes.length) return;

  // Focus first box
  boxes[0].focus();

  // Auto-advance and backspace handling
  boxes.forEach((box, i) => {
    box.addEventListener("keydown", (e) => {
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        box.value = e.key;
        if (errorEl) errorEl.textContent = "";
        if (i < boxes.length - 1) boxes[i + 1].focus();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        box.value = "";
        if (i > 0) boxes[i - 1].focus();
      }
    });
  });

  function showError(msg) {
    if (errorEl) errorEl.textContent = msg;
    boxes.forEach((b) => (b.value = ""));
    boxes[0].focus();
  }

  // Continue button
  continueBtn.addEventListener("click", () => {
    const pin = boxes.map((b) => b.value).join("");
    if (pin.length < 4) {
      showError("Please enter all 4 digits.");
      return;
    }

    fetch("/api/childlock.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", pin }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          overlay.style.display = "none";
          card.style.display = "";
        } else {
          showError("Incorrect PIN. Please try again.");
        }
      })
      .catch(() => {
        showError("Could not verify PIN. Please try again.");
      });
  });
}
