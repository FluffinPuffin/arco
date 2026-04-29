document.addEventListener("DOMContentLoaded", () => {
    initContact();
});

function initContact() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = form.querySelector("#name")?.value?.trim();
        const email = form.querySelector("#email")?.value?.trim();
        const message = form.querySelector("#message")?.value?.trim();

        if (!name || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        const submitBtn = form.querySelector(".cta-button");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        fetch("https://formspree.io/f/mlgarpen", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ name, email, message })
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                submitBtn.textContent = "Message sent!";
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    form.reset();
                }, 2000);
            } else {
                alert("Failed to send. Please try again.");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        })
        .catch(() => {
            alert("Failed to send. Please try again.");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}