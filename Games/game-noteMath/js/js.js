document.addEventListener("frame:ready", () => {
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
