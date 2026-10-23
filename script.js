// Start: Get the page elements used by the navigation behaviors.
const navbar = document.getElementById('navbar');
const menuIcon = document.getElementById('menuIcon');
const navLinks = document.getElementById('navLinks');
// End: Navigation element references.

// Start: Show the compact logo after the visitor scrolls down the page.
function updateScrolledNavigation() {
    navbar.classList.toggle('scrolled', window.scrollY > 100);
}

window.addEventListener('scroll', updateScrolledNavigation, { passive: true });
updateScrolledNavigation();
// End: Scroll-based logo behavior.

// Start: Toggle the mobile navigation menu when its menu icon is clicked.
menuIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    menuIcon.classList.toggle('active');
    navLinks.classList.toggle('active');
});
// End: Mobile menu toggle.

// Start: Close the mobile navigation when a click happens outside it.
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuIcon.contains(e.target)) {
        menuIcon.classList.remove('active');
        navLinks.classList.remove('active');
    }
});
// End: Click-outside menu behavior.

// Start: Close the mobile navigation after a navigation link is selected.
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuIcon.classList.remove('active');
        navLinks.classList.remove('active');
    });
});
// End: Navigation link menu behavior.

// Start: Smoothly scroll to the page section selected by an in-page link.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// End: In-page smooth scrolling.

/* Start: Submit inquiry details in the background to the Google Apps Script email service. */
(() => {
    // Replace this with the deployed Google Apps Script web app URL.
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvBXXSsKNBEus52jGa6NNiBKKp_Qv0mPVNnUsmQJT3fZpxDAipPM5c7SZZTUYwg2v1cQ/exec';
    const form = document.getElementById('inquiryForm');
    const status = document.getElementById('formStatus');
    const submitButton = document.getElementById('sendInquiry');
    const requestIdInput = document.getElementById('inquiryRequestId');
    const loadingIndicator = document.getElementById('formLoading');
    const responseFrame = document.querySelector('iframe[name="inquiryResponseFrame"]');
    if (!form || !status || !submitButton || !requestIdInput || !loadingIndicator || !responseFrame) return;

    const serviceIsConfigured = !GOOGLE_APPS_SCRIPT_URL.includes('REPLACE_WITH_DEPLOYMENT_ID');
    if (serviceIsConfigured) {
        form.action = GOOGLE_APPS_SCRIPT_URL;
    }

    // Display a status message and mark errors for the matching CSS style.
    function showStatus(text, isError) {
        status.textContent = text;
        status.classList.toggle('error', Boolean(isError));
    }

    // Post to the hidden response frame so the visitor stays on this page.
    form.addEventListener('submit', (e) => {
        if (!serviceIsConfigured) {
            e.preventDefault();
            showStatus('The inquiry service is not configured yet. Please contact us on WhatsApp.', true);
            return;
        }

        const requestId = crypto.randomUUID();
        requestIdInput.value = requestId;
        form.dataset.pendingRequestId = requestId;
        submitButton.disabled = true;
        form.classList.add('is-submitting');
        form.setAttribute('aria-busy', 'true');
        loadingIndicator.setAttribute('aria-hidden', 'false');
        showStatus('Sending your inquiry...', false);

        window.setTimeout(() => {
            if (form.dataset.pendingRequestId === requestId) {
                delete form.dataset.pendingRequestId;
                submitButton.disabled = false;
                form.classList.remove('is-submitting');
                form.removeAttribute('aria-busy');
                loadingIndicator.setAttribute('aria-hidden', 'true');
                showStatus('The inquiry service did not respond. Please try again later.', true);
            }
        }, 30000);
    });

    // Accept only a response carrying the one-time ID for the current submission.
    window.addEventListener('message', (event) => {
        let result;
        try {
            result = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch (error) {
            return;
        }

        if (!result || result.type !== 'sonigroups-inquiry-result') return;
        if (!form.dataset.pendingRequestId || result.requestId !== form.dataset.pendingRequestId) return;

        delete form.dataset.pendingRequestId;
        submitButton.disabled = false;
        form.classList.remove('is-submitting');
        form.removeAttribute('aria-busy');
        loadingIndicator.setAttribute('aria-hidden', 'true');
        if (result.ok) {
            form.reset();
            showStatus('Thank you. Your inquiry has been sent to our team.', false);
        } else {
            showStatus(result.message || 'We could not send your inquiry. Please try again.', true);
        }
    });
})();
/* End: Contact inquiry submission behavior. */
