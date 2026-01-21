fetch("../../../frame/html/index.html")
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.text();
    })
    .then(html => {
        document.body.insertAdjacentHTML("afterbegin", html);
    })
    .catch(err => console.error("Frame load failed:", err));

