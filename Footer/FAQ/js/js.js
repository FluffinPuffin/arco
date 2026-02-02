document.addEventListener("frame:ready", () => {
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

  fetch("./content.html")
    .then((res) => {
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then((content) => {
      document.getElementById("content").insertAdjacentHTML("beforeend", content);
      initFAQ();
    })
    .catch((err) => console.error("CONTENT LOAD FAILED:", err));
});

function initFAQ() {
  const content = document.getElementById("content");
  if (!content) return;

  // Category navigation
  content.querySelectorAll(".faq-nav-item[data-category]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const category = item.dataset.category;
      content.querySelectorAll(".faq-nav-item").forEach((n) => n.classList.remove("active"));
      item.classList.add("active");
      content.querySelectorAll(".faq-category-content").forEach((panel) => {
        panel.hidden = panel.dataset.category !== category;
      });
    });
  });

  // Accordion toggle
  content.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const answer = content.querySelector(btn.getAttribute("aria-controls"));
      const isExpanded = item.classList.contains("faq-item-expanded");

      if (isExpanded) {
        item.classList.remove("faq-item-expanded");
        if (answer) answer.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("faq-item-expanded");
        if (answer) answer.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Search filter
  const searchInput = content.querySelector(".faq-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      content.querySelectorAll(".faq-item").forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        const text = (question?.textContent || "") + (answer?.textContent || "");
        item.style.display = query === "" || text.toLowerCase().includes(query) ? "" : "none";
      });
    });
  }
}
