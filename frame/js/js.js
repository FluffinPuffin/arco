fetch("/frame/html/index.html")
  .then(response => {
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    return response.text();
  })
  .then(html => {
    document.body.insertAdjacentHTML("afterbegin", html);

    document.dispatchEvent(new Event("frame:ready"));

  })
  .catch(err => console.error("Frame load failed:", err));

function goBack() {
  window.history.back();
}

