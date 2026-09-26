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
const landing = document.querySelector('.landing');

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

    if (navbar) {
        // Keep the nav out of the way until the full-screen landing is scrolled past.
        const pastLanding = !landing || y > landing.offsetHeight - navbar.offsetHeight;
        navbar.classList.toggle('is-hidden', !pastLanding);
        navbar.classList.toggle('scrolled', pastLanding);
    }

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
    '.hero-intro, .hero-actions, .trust-bar, .section-head, .engagement-card, .step, .stat-card, .tech-category, .about-text, .intro-statement, .intro-inner, .audience, .cta-inner, .contact-intro, .contact-form-wrap'
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
   Capabilities solar system
   ------------------------------------------------------------ */
const orbitSystem = document.querySelector('.orbit-system');

if (orbitSystem) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const RING_FRACTIONS = [0.34, 0.54, 0.76, 0.97];  // orbit radius as a share of the usable half width
    const PERIODS = [26, 38, 52, 68];                 // seconds per revolution, inner orbits run faster

    const ringsBack = orbitSystem.querySelector('.orbit-rings-back');
    const ringsFront = orbitSystem.querySelector('.orbit-rings-front');
    const legendItems = document.querySelectorAll('.capability-stack .tech-category');
    const planetEls = [...orbitSystem.querySelectorAll('.planet')];

    const planets = planetEls.map(el => ({ el, orbit: Number(el.dataset.orbit) }));
    RING_FRACTIONS.forEach((_, orbit) => {
        const members = planets.filter(p => p.orbit === orbit);
        members.forEach((p, i) => {
            p.phase = (i / members.length) * Math.PI * 2 + orbit * 0.9;
        });
    });

    const ringPaths = RING_FRACTIONS.map((_, orbit) => {
        const back = document.createElementNS(SVG_NS, 'path');
        const front = document.createElementNS(SVG_NS, 'path');
        ringsBack.appendChild(back);
        ringsFront.appendChild(front);
        return { orbit, back, front };
    });

    let geometry = null;

    function layout() {
        const width = orbitSystem.clientWidth;
        const planetSize = parseFloat(getComputedStyle(orbitSystem).getPropertyValue('--planet-size')) || 64;
        const halfWidth = width / 2 - planetSize * 0.75;
        const radii = RING_FRACTIONS.map(f => f * halfWidth);
        // Vertical squash of each orbit: flatter on wide screens, rounder on narrow ones.
        const tilt = Math.min(0.56, Math.max(0.34, 0.34 + (900 - width) * 0.00045));
        const height = Math.round(radii[radii.length - 1] * tilt * 2 + planetSize * 2.6);
        orbitSystem.style.height = `${height}px`;

        geometry = { cx: width / 2, cy: height / 2, radii, tilt };

        ringPaths.forEach(({ orbit, back, front }) => {
            const rx = radii[orbit];
            const { cx, cy, tilt } = geometry;
            const ry = rx * tilt;
            // Upper half of the ellipse sits behind the sun, lower half in front.
            back.setAttribute('d', `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`);
            front.setAttribute('d', `M ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy}`);
        });
    }

    function render(time) {
        const { cx, cy, radii, tilt } = geometry;
        planets.forEach(p => {
            const angle = p.phase + (time / 1000 / PERIODS[p.orbit]) * Math.PI * 2;
            const rx = radii[p.orbit];
            const x = cx + Math.cos(angle) * rx;
            const y = cy + Math.sin(angle) * rx * tilt;
            const depth = Math.sin(angle);                     // -1 far side, 1 near side
            const scale = 0.72 + (depth + 1) * 0.19;
            const shade = 0.55 + (depth + 1) * 0.225;

            // Light each sphere from the sun's direction.
            const dx = cx - x;
            const dy = cy - y;
            const dist = Math.hypot(dx, dy) || 1;
            p.el.style.setProperty('--lx', `${50 + (dx / dist) * 26}%`);
            p.el.style.setProperty('--ly', `${50 + (dy / dist) * 26}%`);
            p.el.style.setProperty('--spin', `${Math.cos(angle) * -35}deg`);

            p.el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            p.el.style.zIndex = String(depth >= 0 ? 52 + Math.round(depth * 40) : 10 + Math.round((depth + 1) * 30));
            p.el.style.filter = `brightness(${shade})`;
        });
    }

    let running = false;
    let paused = false;
    let elapsed = 0;
    let last = 0;

    function frame(now) {
        if (!running) return;
        if (!paused) elapsed += Math.min(now - last, 100);
        last = now;
        render(elapsed);
        requestAnimationFrame(frame);
    }

    function start() {
        if (running || reducedMotion.matches) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
    }
    function stop() { running = false; }

    function setActive(orbit) {
        planets.forEach(p => p.el.classList.toggle('is-active', p.orbit === orbit));
        ringPaths.forEach(r => {
            r.back.classList.toggle('is-active', r.orbit === orbit);
            r.front.classList.toggle('is-active', r.orbit === orbit);
        });
        legendItems.forEach(item => item.classList.toggle('is-active', Number(item.dataset.orbit) === orbit));
    }

    planets.forEach(p => {
        p.el.addEventListener('mouseenter', () => { paused = true; setActive(p.orbit); });
        p.el.addEventListener('mouseleave', () => { paused = false; setActive(null); });
    });
    legendItems.forEach(item => {
        item.addEventListener('mouseenter', () => setActive(Number(item.dataset.orbit)));
        item.addEventListener('mouseleave', () => setActive(null));
    });

    layout();
    render(elapsed);

    window.addEventListener('resize', () => { layout(); render(elapsed); });
    reducedMotion.addEventListener('change', () => { stop(); render(elapsed); start(); });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            entries.forEach(entry => (entry.isIntersecting ? start() : stop()));
        }).observe(orbitSystem);
    } else {
        start();
    }
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
