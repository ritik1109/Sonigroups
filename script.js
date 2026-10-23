// Start: Get the page elements used by the navigation behaviors.
const navbar = document.getElementById('navbar');
const menuIcon = document.getElementById('menuIcon');
const navLinks = document.getElementById('navLinks');
// End: Navigation element references.

// Start: Show the compact logo after the visitor scrolls down the page.
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
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
