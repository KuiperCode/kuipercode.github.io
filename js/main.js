/* ============================================================
   Kuiper Code — high-end technology leadership practice
   ============================================================ */

// Initialize EmailJS (the CDN script may be blocked or fail to load)
const hasEmailJS = typeof window.emailjs !== 'undefined';
if (hasEmailJS) emailjs.init("user_lUYOT0ZbunzqDkD3KIehL");

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => (reducedMotion.matches ? 'auto' : 'smooth');

/* ------------------------------------------------------------
   Mobile navigation
   ------------------------------------------------------------ */
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ------------------------------------------------------------
   Smooth scrolling for in-page anchors
   ------------------------------------------------------------ */
const navbar = document.querySelector('.navbar');

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top, behavior: scrollBehavior() });
    });
});

/* ------------------------------------------------------------
   Navbar scrolled state + active link
   ------------------------------------------------------------ */
const sections = document.querySelectorAll('section[id], header[id]');

function onScroll() {
    const y = window.pageYOffset;

    if (navbar) navbar.classList.toggle('scrolled', y > 24);

    sections.forEach(section => {
        const top = section.offsetTop - 120;
        const bottom = top + section.offsetHeight;
        const link = document.querySelector(`.nav-menu a[href="#${section.id}"]`);
        if (!link) return;
        if (y >= top && y < bottom) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ------------------------------------------------------------
   Scroll-reveal animations
   ------------------------------------------------------------ */
const revealTargets = document.querySelectorAll(
    '.section-head, .engagement-card, .step, .stat-card, .tech-category, .about-text, .intro-statement, .intro-inner, .audience, .cta-inner, .contact-intro, .contact-form-wrap'
);

if ('IntersectionObserver' in window) {
    revealTargets.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                const delay = entry.target.closest('.engagement-grid, .approach-grid, .capability-stack, .about-stats')
                    ? (i % 6) * 70
                    : 0;
                setTimeout(() => entry.target.classList.add('is-visible'), delay);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
}

/* ------------------------------------------------------------
   Contact form (EmailJS)
   ------------------------------------------------------------ */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const formError = document.getElementById('form-error');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!hasEmailJS) {
            formError.style.display = 'block';
            formError.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';

        emailjs.sendForm('service_i6dnh9n', 'template_ya6gzou', contactForm).then(
            function () {
                contactForm.reset();
                contactForm.style.display = 'none';
                formError.style.display = 'none';
                formSuccess.style.display = 'block';
                formSuccess.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });

                submitButton.disabled = false;
                submitButton.textContent = originalText;

                setTimeout(() => {
                    contactForm.style.display = 'block';
                    formSuccess.style.display = 'none';
                }, 6000);
            },
            function (error) {
                console.error('EmailJS error:', error);
                formError.style.display = 'block';
                formSuccess.style.display = 'none';
                formError.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });

                submitButton.disabled = false;
                submitButton.textContent = originalText;

                setTimeout(() => { formError.style.display = 'none'; }, 6000);
            }
        );
    });
}
