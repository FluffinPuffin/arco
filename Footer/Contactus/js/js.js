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
      initContact();
    })
    .catch((err) => console.error("CONTENT LOAD FAILED:", err));
});

function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("#contact-name")?.value?.trim();
    const email = form.querySelector("#contact-email")?.value?.trim();
    const message = form.querySelector("#contact-message")?.value?.trim();

    if (!name || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    // Placeholder: show confirmation (no backend)
    const submitBtn = form.querySelector(".contact-submit");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Message sent!";
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
    }, 2000);
  });
}
