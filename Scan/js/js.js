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
      startQrScanner();
    })
    .catch(err => console.error("Content load failed:", err));
});

function startQrScanner() {
    const result = document.getElementById("result");

    if (!result) {
        console.error("Missing #result element");
        return;
    }

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        (decodedText) => {
            result.textContent = "Scanned: " + decodedText;
            console.log("QR:", decodedText);

            // Stop scanning after success
            html5QrCode.stop();
        },
        (error) => {
        }
    );
}
