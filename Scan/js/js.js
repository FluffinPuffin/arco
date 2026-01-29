
fetch("/frame/html/index.html")
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.text();
    })
    .then(html => {
        document.body.insertAdjacentHTML("afterbegin", html)
        startQrScanner();
    })
    .catch(err => console.error("Frame load failed:", err));

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
