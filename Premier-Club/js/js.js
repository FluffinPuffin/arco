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
  const pinForm = document.getElementById("parental-pin-form");
  const noPinEl = document.getElementById("parental-no-pin");

  if (!overlay || !boxes.length) return;

  // Track actual digits separately (inputs show "•" for visual masking)
  const pinDigits = ["", "", "", ""];

  // Check if user has a PIN set before showing the form
  fetch("/api/childlock.php", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      if (!data.has_pin) {
        if (pinForm) pinForm.style.display = "none";
        if (noPinEl) noPinEl.style.display = "flex";
      } else {
        boxes[0].focus();
      }
    })
    .catch(() => {
      // If check fails, just show the form normally
      boxes[0].focus();
    });

  // Auto-advance and backspace handling with "•" visual masking
  boxes.forEach((box, i) => {
    box.addEventListener("keydown", (e) => {
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        pinDigits[i] = e.key;
        box.value = "\u2022";
        box.classList.add("pin-filled");
        if (errorEl) errorEl.textContent = "";
        if (i < boxes.length - 1) boxes[i + 1].focus();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        pinDigits[i] = "";
        box.value = "";
        box.classList.remove("pin-filled");
        if (i > 0) boxes[i - 1].focus();
      }
    });
  });

  function showError(msg) {
    if (errorEl) errorEl.textContent = msg;
    boxes.forEach((b) => { b.value = ""; b.classList.remove("pin-filled"); });
    pinDigits.fill("");
    boxes[0].focus();
  }

  // Continue button
  continueBtn.addEventListener("click", () => {
    const pin = pinDigits.join("");
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
        } else if (data.no_pin_set) {
          if (pinForm) pinForm.style.display = "none";
          if (noPinEl) noPinEl.style.display = "flex";
        } else {
          showError("Incorrect PIN. Please try again.");
        }
      })
      .catch(() => {
        showError("Could not verify PIN. Please try again.");
      });
  });
}
