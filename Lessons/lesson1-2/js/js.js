document.addEventListener("frame:ready", () => {
  // Inject title.html before the rectangle
  const container = document.querySelector('.container');
  if (container) {
    fetch("../html/title.html")
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
    })
    .catch(err => console.error("CONTENT LOAD FAILED:", err));
});