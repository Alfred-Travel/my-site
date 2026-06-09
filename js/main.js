function scrollToHashAnchor(behavior = "smooth") {
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!target) return;

    const navbarHeight = 90;
    const targetPosition = Math.max(0, target.offsetTop - navbarHeight);
    window.scrollTo({
        top: targetPosition,
        behavior
    });
}

function initSearchTabs() {
    const searchTabs = document.querySelectorAll(".search-tab");
    if (!searchTabs.length) return;

    const searchInput = document.getElementById("search-destination");
    const searchButton = document.querySelector(".search-button");
    const placeholders = {
        flights: "Where would you like to fly?",
        hotels: "Where are you staying?",
        activities: "What would you like to do?"
    };

    searchTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            searchTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            if (searchInput) {
                const tabType = tab.getAttribute("data-tab");
                searchInput.placeholder = placeholders[tabType] || "Where do you want to go?";
            }
        });
    });

    if (!searchButton) return;
    searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        const destination = searchInput ? searchInput.value.trim() : "";
        if (!destination) {
            if (searchInput) searchInput.focus();
            return;
        }

        const featuresSection = document.querySelector("#features");
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

function initMobileNavigation() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    if (!hamburger || !navLinks) return null;

    hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        document.body.classList.toggle("tai-nav-open", isOpen && document.body.classList.contains("home-page"));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 1023) {
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
                hamburger.setAttribute("aria-label", "Open menu");
                document.body.classList.remove("tai-nav-open");
            }
        });
    });

    return navLinks;
}

function initAnchorScrolling(navLinks) {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const href = anchor.getAttribute("href");
            if (!href || !href.startsWith("#") || href.length <= 1) return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (!target) return;

            scrollToHashAnchor("smooth");

            if (history.pushState) {
                history.pushState(null, "", href);
            }

            if (window.innerWidth <= 768 && navLinks) {
                navLinks.classList.remove("active");
            }
        });
    });

    window.addEventListener("load", () => {
        setTimeout(() => scrollToHashAnchor("smooth"), 300);
    });
    window.addEventListener("hashchange", () => {
        setTimeout(() => scrollToHashAnchor("smooth"), 0);
    });
}

function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Thank you for your message! We will get back to you soon.");
        contactForm.reset();
    });
}

function initNavbarShrink() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle("shrink", window.scrollY > 100);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();
}

function initServiceCardAnimation() {
    const serviceCards = document.querySelectorAll(".service-card");
    if (!serviceCards.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    serviceCards.forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(card);
    });
}

function initPressCarousel() {
    const pressCarousel = document.querySelector("[data-carousel]");
    if (!pressCarousel) return;

    const slides = Array.from(pressCarousel.querySelectorAll("[data-press-slide]"));
    const previews = Array.from(pressCarousel.querySelectorAll("[data-press-preview]"));
    const dots = Array.from(pressCarousel.querySelectorAll("[data-press-dot]"));
    const prevButton = pressCarousel.querySelector("[data-carousel-prev]");
    const nextButton = pressCarousel.querySelector("[data-carousel-next]");
    if (!slides.length) return;
    if (!previews.length && !dots.length && !prevButton && !nextButton) return;

    let activeIndex = 0;

    const updatePressCarousel = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === activeIndex);
        });
        previews.forEach((preview, previewIndex) => {
            preview.classList.toggle("is-active", previewIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-selected", isActive ? "true" : "false");
        });
    };

    previews.forEach((preview, index) => {
        preview.addEventListener("click", () => updatePressCarousel(index));
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => updatePressCarousel(index));
    });

    if (prevButton) {
        prevButton.addEventListener("click", () => updatePressCarousel(activeIndex - 1));
    }
    if (nextButton) {
        nextButton.addEventListener("click", () => updatePressCarousel(activeIndex + 1));
    }

    updatePressCarousel(0);
}

class CookieConsent {
    constructor() {
        this.cookiesBanner = document.getElementById("cookies-banner");
        this.acceptAll = document.getElementById("accept-all-cookies");
        this.rejectAll = document.getElementById("reject-cookies");
        this.init();
    }

    init() {
        // Local file previews (file://) don't reliably persist cookies/storage.
        // Skip the banner there to avoid repeated prompts during static preview.
        if (window.location.protocol === "file:") {
            this.hideBanner();
            return;
        }

        if (!this.getPreference("cookie_consent")) {
            this.showBanner();
        } else {
            this.loadCookies();
        }
        this.bindEvents();
    }

    bindEvents() {
        if (this.acceptAll) {
            this.acceptAll.addEventListener("click", () => this.acceptAllCookies());
        }
        if (this.rejectAll) {
            this.rejectAll.addEventListener("click", () => this.rejectAllCookies());
        }
    }

    showBanner() {
        if (!this.cookiesBanner) return;
        const delay = document.body.classList.contains("home-page") ? 5000 : 1000;
        setTimeout(() => this.cookiesBanner.classList.add("show"), delay);
    }

    hideBanner() {
        if (this.cookiesBanner) {
            this.cookiesBanner.classList.remove("show");
        }
    }

    acceptAllCookies() {
        this.setPreference("cookie_consent", "all", 365);
        this.setPreference("analytics_cookies", "true", 365);
        this.setPreference("marketing_cookies", "true", 365);
        this.setPreference("functional_cookies", "true", 365);
        this.setPreference("cookie_consent_date", new Date().toISOString(), 365);
        this.hideBanner();
        this.loadCookies();
        this.showNotification("Cookie preferences saved", "success");
    }

    rejectAllCookies() {
        this.setPreference("cookie_consent", "rejected", 365);
        this.setPreference("analytics_cookies", "false", 365);
        this.setPreference("marketing_cookies", "false", 365);
        this.setPreference("functional_cookies", "false", 365);
        this.setPreference("cookie_consent_date", new Date().toISOString(), 365);
        this.hideBanner();
        this.showNotification("Only essential cookies will be used", "info");
    }

    loadCookies() {
        const consent = this.getPreference("cookie_consent");
        if (consent !== "all") return;

        if (this.getPreference("analytics_cookies") === "true") this.loadAnalyticsCookies();
        if (this.getPreference("marketing_cookies") === "true") this.loadMarketingCookies();
        if (this.getPreference("functional_cookies") === "true") this.loadFunctionalCookies();
    }

    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `cookie-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#35D0BA" : "#666"};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = "1";
            notification.style.transform = "translateX(0)";
        }, 100);
        setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translateX(100%)";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadAnalyticsCookies() {}
    loadMarketingCookies() {}
    loadFunctionalCookies() {}

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i += 1) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === " ") cookie = cookie.substring(1, cookie.length);
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    }

    setPreference(name, value, days = 365) {
        this.setCookie(name, value, days);
        try {
            localStorage.setItem(`cookie_${name}`, value);
        } catch (_) {
            // localStorage may be unavailable in private browsing or restricted environments
        }
    }

    getPreference(name) {
        const cookieValue = this.getCookie(name);
        if (cookieValue !== null) return cookieValue;

        try {
            return localStorage.getItem(`cookie_${name}`);
        } catch (_) {
            return null;
        }
    }
}

function initFaqAccordion() {
    const triggers = document.querySelectorAll(".faq-accordion-trigger");
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const expanded = trigger.getAttribute("aria-expanded") === "true";
            const panel = document.getElementById(trigger.getAttribute("aria-controls"));

            triggers.forEach((item) => {
                item.setAttribute("aria-expanded", "false");
                const controlledPanel = document.getElementById(item.getAttribute("aria-controls"));
                if (controlledPanel) controlledPanel.hidden = true;
            });

            if (!expanded && panel) {
                trigger.setAttribute("aria-expanded", "true");
                panel.hidden = false;
            }
        });
    });
}

function initHowCardsHoverSync() {
    const stepWrappers = document.querySelectorAll(".how-step-wrapper");
    stepWrappers.forEach((wrapper) => {
        const textCard = wrapper.querySelector(".how-card-text");
        const imageCard = wrapper.querySelector(".how-card-image");
        if (!textCard || !imageCard) return;

        textCard.addEventListener("mouseenter", () => imageCard.classList.add("hover-sync"));
        textCard.addEventListener("mouseleave", () => imageCard.classList.remove("hover-sync"));
        imageCard.addEventListener("mouseenter", () => textCard.classList.add("hover-sync"));
        imageCard.addEventListener("mouseleave", () => textCard.classList.remove("hover-sync"));
    });
}

function initItinerarySwipeView() {
    const source = document.querySelector(".itinerary-sample");
    if (!source) return;

    const raw = source.textContent.replace(/\r/g, "").trim();
    if (!raw) return;

    const sections = raw
        .split(/(?=Day\s+\d+\s+[—-])/)
        .map((section) => section.trim())
        .filter(Boolean)
        .slice(0, 3);

    if (!sections.length) return;

    const dayData = sections.map((section, index) => {
        const lines = section
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        const heading = lines[0] || `Day ${index + 1}`;
        const headingMatch = heading.match(/^Day\s+(\d+)\s+[—-]\s+(.*)$/i);
        const dayLabel = headingMatch ? `Day ${headingMatch[1]}` : `Day ${index + 1}`;
        const focus = headingMatch ? headingMatch[2] : heading;

        const bulletLines = lines.filter((line) => line.startsWith("•"));
        const fallbackItems = lines.slice(1).filter((line) => !line.startsWith("•"));
        const itemsSource = bulletLines.length ? bulletLines : fallbackItems;
        const times = ["09:00 AM", "12:30 PM", "03:30 PM", "07:00 PM", "09:00 PM"];

        const items = itemsSource.map((itemLine, itemIndex) => {
            const cleaned = itemLine.replace(/^•\s*/, "");
            const split = cleaned.split(/:\s+/);
            return {
                time: times[itemIndex] || "Anytime",
                title: split[0] || cleaned,
                description: split.length > 1 ? split.slice(1).join(": ") : "Planned stop for this part of your day."
            };
        });

        return { dayLabel, focus, items };
    });

    let activeIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    const wrapper = document.createElement("section");
    wrapper.className = "itinerary-swipe";
    wrapper.setAttribute("aria-label", "Swipeable 3-day itinerary");

    const tabs = document.createElement("div");
    tabs.className = "itinerary-swipe-tabs";
    tabs.setAttribute("role", "tablist");

    const panels = document.createElement("div");
    panels.className = "itinerary-swipe-panels";

    dayData.forEach((day, dayIndex) => {
        const tab = document.createElement("button");
        tab.className = `itinerary-swipe-tab${dayIndex === 0 ? " is-active" : ""}`;
        tab.type = "button";
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", dayIndex === 0 ? "true" : "false");
        tab.textContent = day.dayLabel;
        tab.addEventListener("click", () => updateActiveDay(dayIndex));
        tabs.appendChild(tab);

        const panel = document.createElement("article");
        panel.className = `itinerary-swipe-panel${dayIndex === 0 ? " is-active" : ""}`;
        panel.setAttribute("role", "tabpanel");
        panel.innerHTML = `
            <p class="itinerary-swipe-focus">${day.focus}</p>
            <div class="itinerary-swipe-timeline">
                ${day.items
                    .map((item) => `
                        <div class="itinerary-swipe-item">
                            <div class="itinerary-swipe-dot" aria-hidden="true"></div>
                            <div class="itinerary-swipe-card">
                                <p class="itinerary-swipe-time">${item.time}</p>
                                <h4>${item.title}</h4>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    `)
                    .join("")}
            </div>
        `;
        panels.appendChild(panel);
    });

    const updateActiveDay = (nextIndex) => {
        if (nextIndex < 0 || nextIndex >= dayData.length) return;
        activeIndex = nextIndex;

        const tabEls = tabs.querySelectorAll(".itinerary-swipe-tab");
        const panelEls = panels.querySelectorAll(".itinerary-swipe-panel");

        tabEls.forEach((tab, index) => {
            const isActive = index === activeIndex;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        panelEls.forEach((panel, index) => {
            panel.classList.toggle("is-active", index === activeIndex);
        });
    };

    panels.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    panels.addEventListener("touchend", (event) => {
        touchEndX = event.changedTouches[0].screenX;
        const delta = touchStartX - touchEndX;
        if (Math.abs(delta) < 45) return;
        if (delta > 0) updateActiveDay(activeIndex + 1);
        if (delta < 0) updateActiveDay(activeIndex - 1);
    }, { passive: true });

    wrapper.appendChild(tabs);
    wrapper.appendChild(panels);
    source.insertAdjacentElement("afterend", wrapper);
    source.classList.add("itinerary-sample-source");
}

function initMobileDownloadBar() {
    const bar = document.getElementById("mobile-download-bar");
    if (!bar) return;

    const showBar = () => {
        if (window.innerWidth > 768) {
            bar.hidden = true;
            document.body.classList.remove("has-mobile-download-bar");
            return;
        }
        const downloads = document.getElementById("app-downloads");
        if (!downloads) return;
        const rect = downloads.getBoundingClientRect();
        const pastHero = window.scrollY > 120;
        const downloadsVisible = rect.top < window.innerHeight && rect.bottom > 0;
        const shouldShow = pastHero && !downloadsVisible;
        bar.hidden = !shouldShow;
        document.body.classList.toggle("has-mobile-download-bar", shouldShow);
    };

    window.addEventListener("scroll", showBar, { passive: true });
    window.addEventListener("resize", showBar, { passive: true });
    showBar();
}

function initSite() {
    const navLinks = initMobileNavigation();
    initMobileDownloadBar();
    initSearchTabs();
    initAnchorScrolling(navLinks);
    initContactForm();
    initNavbarShrink();
    initServiceCardAnimation();
    initPressCarousel();
    initFaqAccordion();
    initHowCardsHoverSync();
    initItinerarySwipeView();

    if (!window.__cookieConsentInitialized) {
        window.__cookieConsentInitialized = true;
        new CookieConsent();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSite);
} else {
    initSite();
}

 