document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    initMobileNavigation();
    initScrollReveal();
    initAwardsCarousel();
    initQueryDetailView("product", "[data-product-card]", "product-detail-mode");
    initQueryDetailView("career", "[data-career-card]", "career-detail-mode");
    initQueryDetailView("publication", "[data-publication-card]", "publication-detail-mode");
});

function initMobileNavigation() {
    const navbar = document.querySelector(".site-navbar");
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");

    if (!navbar || !toggle || !menu) {
        return;
    }

    const setOpen = (isOpen) => {
        navbar.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });

    const desktopQuery = window.matchMedia("(min-width: 981px)");
    const handleDesktopChange = () => {
        if (desktopQuery.matches) {
            setOpen(false);
        }
    };

    if (desktopQuery.addEventListener) {
        desktopQuery.addEventListener("change", handleDesktopChange);
    } else {
        desktopQuery.addListener(handleDesktopChange);
    }
}

function initScrollReveal() {
    const items = document.querySelectorAll(".scroll-reveal");

    if (!items.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.12
        }
    );

    items.forEach((item) => observer.observe(item));
}

function initAwardsCarousel() {
    const root = document.querySelector("[data-awards]");

    if (!root) {
        return;
    }

    const track = root.querySelector("[data-awards-track]");
    const pages = Array.from(root.querySelectorAll("[data-awards-page]"));
    const prev = root.querySelector("[data-awards-prev]");
    const next = root.querySelector("[data-awards-next]");

    if (!track || !pages.length || !prev || !next) {
        return;
    }

    let index = 0;

    const update = () => {
        track.style.transform = `translateX(-${index * 100}%)`;
        prev.disabled = index === 0;
        next.disabled = index === pages.length - 1;
    };

    prev.addEventListener("click", () => {
        index = Math.max(0, index - 1);
        update();
    });

    next.addEventListener("click", () => {
        index = Math.min(pages.length - 1, index + 1);
        update();
    });

    update();
}

function initQueryDetailView(paramName, cardSelector, bodyClass) {
    const cards = Array.from(document.querySelectorAll(cardSelector));

    if (!cards.length) {
        return;
    }

    const selectedId = new URLSearchParams(window.location.search).get(paramName);

    if (!selectedId) {
        return;
    }

    const selectedCard = cards.find((card) => card.dataset[paramName] === selectedId);

    if (!selectedCard) {
        return;
    }

    document.body.classList.add(bodyClass);
    selectedCard.classList.add("is-selected");
    selectedCard.setAttribute("aria-current", "true");
}
