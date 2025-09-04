// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Smooth Scrolling for Navigation Links
const anchorLinks = document.querySelectorAll('a[href^="#"]');
if (anchorLinks.length > 0) {
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = 80; // Height of the fixed navbar
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
}

// Form Submission
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            message: document.getElementById('message')?.value || ''
        };

        // Here you would typically send the data to a server
        console.log('Form submitted:', formData);
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = 'var(--white)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// Add animation to service cards on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

const serviceCards = document.querySelectorAll('.service-card');
if (serviceCards.length > 0) {
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// Cookies Banner Functionality
class CookieConsent {
    constructor() {
        this.cookiesBanner = document.getElementById('cookies-banner');
        this.modal = document.getElementById('cookie-settings-modal');
        this.cookieSettings = document.getElementById('cookie-settings');
        this.closeModal = document.getElementById('close-modal');
        this.acceptAll = document.getElementById('accept-all-cookies');
        this.rejectAll = document.getElementById('reject-cookies');
        this.customize = document.getElementById('customize-cookies');
        this.savePreferences = document.getElementById('save-preferences');
        this.acceptAllModal = document.getElementById('accept-all-modal');
        
        console.log('Cookies banner element:', this.cookiesBanner);
        console.log('Modal element:', this.modal);
        console.log('Accept All button:', this.acceptAll);
        console.log('Reject All button:', this.rejectAll);
        console.log('Customize button:', this.customize);
        
        this.cookiePreferences = {
            essential: true, // Always true
            analytics: false,
            marketing: false,
            functional: false
        };
        
        this.init();
    }
    
    init() {
        // Check if user has already made a choice
        const consent = this.getCookie('cookie_consent');
        console.log('Current cookie consent:', consent);
        
        if (!consent) {
            console.log('No consent found, showing banner...');
            this.showBanner();
        } else {
            console.log('Consent already exists, not showing banner');
            // Load cookies based on existing consent
            this.loadCookies();
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Add event listeners with null checks
        if (this.acceptAll) {
            this.acceptAll.addEventListener('click', () => {
                console.log('Accept All clicked');
                this.acceptAllCookies();
            });
        }
        
        if (this.rejectAll) {
            this.rejectAll.addEventListener('click', () => {
                console.log('Reject All clicked');
                this.rejectAllCookies();
            });
        }
    }
    
    showBanner() {
        console.log('Showing cookies banner...');
        setTimeout(() => {
            if (this.cookiesBanner) {
                this.cookiesBanner.classList.add('show');
                console.log('Banner should now be visible');
            } else {
                console.error('Cookies banner element not found!');
            }
        }, 1000); // Show after 1 second
    }
    
    hideBanner() {
        console.log('Hiding banner...');
        if (this.cookiesBanner) {
            this.cookiesBanner.classList.remove('show');
            console.log('Banner hidden successfully');
        } else {
            console.error('Banner element not found when trying to hide');
        }
    }
    
    showModal() {
        this.modal.classList.add('show');
        this.hideBanner();
    }
    
    hideModal() {
        this.modal.classList.remove('show');
    }
    
    acceptAllCookies() {
        console.log('=== ACCEPT ALL COOKIES CALLED ===');
        this.cookiePreferences = {
            essential: true,
            analytics: true,
            marketing: true,
            functional: true
        };
        
        // Set GDPR-compliant consent cookies
        this.setCookie('cookie_consent', 'all', 365);
        this.setCookie('analytics_cookies', 'true', 365);
        this.setCookie('marketing_cookies', 'true', 365);
        this.setCookie('functional_cookies', 'true', 365);
        this.setCookie('cookie_consent_date', new Date().toISOString(), 365);
        
        console.log('All cookies set, now hiding banner...');
        // Hide banner and load cookies
        this.hideBanner();
        this.loadCookies();
        
        // Optional: Show a subtle notification instead of popup
        this.showNotification('Cookie preferences saved', 'success');
        
        // Verify cookies were set
        setTimeout(() => {
            console.log('Verifying cookies after 1 second...');
            console.log('cookie_consent:', this.getCookie('cookie_consent'));
            console.log('All cookies:', document.cookie);
        }, 1000);
    }
    
    rejectAllCookies() {
        console.log('=== REJECT ALL COOKIES CALLED ===');
        this.cookiePreferences = {
            essential: true,
            analytics: false,
            marketing: false,
            functional: false
        };
        
        // Set GDPR-compliant rejection cookies
        this.setCookie('cookie_consent', 'rejected', 365);
        this.setCookie('analytics_cookies', 'false', 365);
        this.setCookie('marketing_cookies', 'false', 365);
        this.setCookie('functional_cookies', 'false', 365);
        this.setCookie('cookie_consent_date', new Date().toISOString(), 365);
        
        console.log('Rejection cookies set, now hiding banner...');
        // Hide banner - no cookies loaded
        this.hideBanner();
        
        // Optional: Show a subtle notification
        this.showNotification('Only essential cookies will be used', 'info');
        
        // Verify cookies were set
        setTimeout(() => {
            console.log('Verifying cookies after 1 second...');
            console.log('cookie_consent:', this.getCookie('cookie_consent'));
            console.log('All cookies:', document.cookie);
        }, 1000);
    }
    
    saveCookiePreferences() {
        console.log('Saving cookie preferences...');
        this.setCookie('cookie_consent', 'custom', 365);
        this.setCookie('analytics_cookies', this.cookiePreferences.analytics.toString(), 365);
        this.setCookie('marketing_cookies', this.cookiePreferences.marketing.toString(), 365);
        this.setCookie('functional_cookies', this.cookiePreferences.functional.toString(), 365);
        
        // Show success message
        alert('Cookie preferences saved successfully!');
        
        this.hideModal();
        this.loadCookies();
    }
    
    loadCookies() {
        // Only load cookies if user has given explicit consent
        const consent = this.getCookie('cookie_consent');
        
        if (consent === 'all') {
            // Load analytics cookies if accepted
            if (this.getCookie('analytics_cookies') === 'true') {
                this.loadAnalyticsCookies();
            }
            
            // Load marketing cookies if accepted
            if (this.getCookie('marketing_cookies') === 'true') {
                this.loadMarketingCookies();
            }
            
            // Load functional cookies if accepted
            if (this.getCookie('functional_cookies') === 'true') {
                this.loadFunctionalCookies();
            }
        } else {
            console.log('No consent given, only essential cookies loaded');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create a subtle notification instead of popup
        const notification = document.createElement('div');
        notification.className = `cookie-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#35D0BA' : '#666'};
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
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    loadAnalyticsCookies() {
        // Google Analytics or other analytics services
        console.log('Loading analytics cookies...');
        // Add your analytics code here
    }
    
    loadMarketingCookies() {
        // Marketing and advertising cookies
        console.log('Loading marketing cookies...');
        // Add your marketing code here
    }
    
    loadFunctionalCookies() {
        // Functional cookies for enhanced user experience
        console.log('Loading functional cookies...');
        // Add your functional cookies code here
    }
    
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        
        // For localhost, don't set domain
        let cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        
        // Add SameSite attribute
        cookieString += ';SameSite=Lax';
        
        // Set the cookie
        document.cookie = cookieString;
        
        console.log(`Cookie set: ${name}=${value} (expires in ${days} days)`);
        console.log(`Full cookie string: ${cookieString}`);
        
        // Also set in localStorage as backup
        try {
            localStorage.setItem(`cookie_${name}`, value);
            console.log(`Also set in localStorage: cookie_${name}=${value}`);
        } catch (e) {
            console.log('localStorage not available');
        }
        
        // Verify the cookie was set
        setTimeout(() => {
            const verifyCookie = this.getCookie(name);
            console.log(`Verification - ${name}: ${verifyCookie}`);
        }, 100);
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        console.log(`Looking for cookie: ${name}`);
        console.log(`All cookies: ${document.cookie}`);
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = c.substring(nameEQ.length, c.length);
                console.log(`Found cookie ${name}: ${value}`);
                return value;
            }
        }
        
        // Try localStorage as fallback
        try {
            const localStorageValue = localStorage.getItem(`cookie_${name}`);
            if (localStorageValue) {
                console.log(`Found in localStorage: ${name}=${localStorageValue}`);
                return localStorageValue;
            }
        } catch (e) {
            console.log('localStorage not available');
        }
        
        console.log(`Cookie ${name} not found in cookies or localStorage`);
        return null;
    }
}

// Test if cookies work at all
function testCookies() {
    console.log('=== TESTING COOKIE FUNCTIONALITY ===');
    document.cookie = 'test_cookie=working;path=/';
    console.log('Test cookie set');
    console.log('All cookies:', document.cookie);
    
    const testValue = document.cookie.includes('test_cookie=working');
    console.log('Test cookie found:', testValue);
    
    if (!testValue) {
        console.error('WARNING: Cookies may not be working in this environment!');
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing cookie consent...');
    testCookies();
    new CookieConsent();
});

// Also try initializing immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting...');
} else {
    console.log('DOM already loaded, initializing immediately...');
    testCookies();
    new CookieConsent();
}

 