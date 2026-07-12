// Loader animation
let progress = 0;
const bar = document.getElementById("progress");
const text = document.getElementById("loadingText");

let load = setInterval(() => {
    progress += 2;
    if (bar) bar.style.width = progress + "%";
    if (text) text.innerText = "Loading " + progress + "%";

    if (progress >= 100) {
        clearInterval(load);
        document.getElementById("loader").style.display = "none";
    }
}, 30);

// Mobile nav
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("navMenu");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        nav.classList.toggle("active");
    });
}

// Scroll animation
window.addEventListener("scroll", () => {
    document.querySelectorAll(".fade-up, .fade-left, .fade-right").forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
            el.classList.add("show");
        }
    });
});
// LEGAL PAGE ANIMATION (privacy + terms cards)
const legalCards = document.querySelectorAll(".legal-card");

window.addEventListener("scroll", () => {
    legalCards.forEach(card => {
        const top = card.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {
            card.classList.add("show");
        }
    });
});

// REVEAL ON SCROLL (ONLY AFTER SCROLL)
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
    reveals.forEach(el => {
        const top = el.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {
            el.classList.add("active");
        }
    });
});
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

const cards = document.querySelectorAll(".legal-card");
const legalTitle = document.querySelector(".legal-title");

window.addEventListener("scroll", () => {

    const scrollY = window.scrollY;

    // ===============================
    // 1. TITLE ZOOM OUT EFFECT
    // ===============================
    if (legalTitle) {
        let scale = 1 - scrollY / 800;
        scale = Math.max(scale, 0.6);

        legalTitle.style.transform = `scale(${scale})`;
    }

    // ===============================
    // 2. REVEAL CARDS ON SCROLL
    // ===============================
    cards.forEach(card => {
        const top = card.getBoundingClientRect().top;

        if (top < window.innerHeight - 120) {
            card.classList.add("active");
        }
    });
});

// ================= REGISTRATION FORM + SUCCESS DIALOG =================
const registerForm = document.getElementById("registerForm");
const successOverlay = document.getElementById("successOverlay");
const successClose = document.getElementById("successClose");

function closeSuccessDialog() {
    if (!successOverlay) return;
    successOverlay.classList.remove("show");
    successOverlay.setAttribute("aria-hidden", "true");
}

function openSuccessDialog() {
    if (!successOverlay) return;
    successOverlay.classList.add("show");
    successOverlay.setAttribute("aria-hidden", "false");
    if (successClose) successClose.focus();
}

if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Native HTML5 validation (required fields, email/url/phone formats)
        if (!registerForm.checkValidity()) {
            registerForm.reportValidity();
            return;
        }

        // Registration succeeded — show confirmation, then reset the form
        openSuccessDialog();
        registerForm.reset();
    });
}

if (successClose) {
    successClose.addEventListener("click", closeSuccessDialog);
}

if (successOverlay) {
    // Close when clicking the dark backdrop (but not the dialog box itself)
    successOverlay.addEventListener("click", (e) => {
        if (e.target === successOverlay) closeSuccessDialog();
    });
}

// Close on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSuccessDialog();
});