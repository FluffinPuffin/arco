document.addEventListener("frame:ready", () => {
    // Load title into the frame's title placeholder
    const titleContainer = document.getElementById('lesson-title');
    if (titleContainer) {
        fetch("./title.html")
            .then(res => {
                if (!res.ok) throw new Error("Failed to load title.html");
                return res.text();
            })
            .then(titleContent => {
                titleContainer.innerHTML = titleContent;
            })
            .catch(err => console.error("Title load failed:", err));
    }

    // Load content
    fetch("./content.html")
        .then(res => {
            if (!res.ok) throw new Error("Failed to load content");
            return res.text();
        })
        .then(content => {
            document.getElementById("content").insertAdjacentHTML("beforeend", content);
        })
        .catch(err => console.error("Content load failed:", err));
})