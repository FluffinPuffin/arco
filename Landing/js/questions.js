document.addEventListener("DOMContentLoaded", () => {
    initLegal();
    initFAQAccordion();
    initFAQSearch();
    initContact();

    const hash = window.location.hash.replace("#", "");
    if (hash) {
        const target = document.querySelector(`.legal-nav-item[data-policy="${hash}"]`);
        if (target) target.click();
    }
});

function initLegal() {
    const content = document.getElementById("content") || document.querySelector(".legal-panels");
    if (!content) return;

    content.querySelectorAll(".legal-nav-item[data-policy]").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const policy = item.dataset.policy;
            content.querySelectorAll(".legal-nav-item").forEach((n) => n.classList.remove("active"));
            item.classList.add("active");
            content.querySelectorAll(".legal-policy-content").forEach((panel) => {
                panel.hidden = panel.dataset.policy !== policy;
            });
        });
    });
}

function initFAQAccordion() {
    document.querySelectorAll(".faq-question").forEach((btn) => {
        btn.addEventListener("click", () => {
            const item = btn.closest(".faq-item");
            const answer = document.querySelector(`#${btn.getAttribute("aria-controls")}`);
            const isExpanded = item.classList.contains("faq-item-expanded");
            if (isExpanded) {
                item.classList.remove("faq-item-expanded");
                if (answer) answer.hidden = true;
                btn.setAttribute("aria-expanded", "false");
            } else {
                item.classList.add("faq-item-expanded");
                if (answer) answer.hidden = false;
                btn.setAttribute("aria-expanded", "true");
            }
        });
    });
}

function initFAQSearch() {
    const searchInput = document.querySelector(".faq-search");
    if (!searchInput) return;
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        document.querySelectorAll(".faq-item").forEach((item) => {
            const text = item.textContent.toLowerCase();
            item.style.display = query === "" || text.includes(query) ? "" : "none";
        });
    });
}

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

        const submitBtn = form.querySelector(".contact-submit");
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
