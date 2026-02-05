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
      initLegal();
    })
    .catch((err) => console.error("CONTENT LOAD FAILED:", err));
});

function initLegal() {
  const content = document.getElementById("content");
  if (!content) return;

  content.querySelectorAll(".legal-nav-item[data-policy]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const policy = item.dataset.policy;
      content.querySelectorAll(".legal-nav-item").forEach((n) => n.classList.remove("active"));
      item.classList.add("active");
      content.querySelectorAll(".legal-policy-content").forEach((panel) => {
        panel.hidden = panel.dataset.policy !== policy;
      });
    });
  });
}
