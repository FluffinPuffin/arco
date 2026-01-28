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

function loadContent(url, push = true) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Failed to load content");
      return res.text();
    })
    .then(html => {
      document.getElementById("content").innerHTML = html;

      if (push) {
        history.pushState({ url }, "", "#"+url);
      }
    })
    .catch(err => console.error(err));
}

window.addEventListener("popstate", event => {
  if (event.state && event.state.url) {
    loadContent(event.state.url, false);
  }
});


function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  }
}

