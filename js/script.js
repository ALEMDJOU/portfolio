// ========================================
// PORTFOLIO - SCRIPTS & ANIMATIONS
// ========================================

'use strict';

// Configuration
const CONFIG = {
    scrollThreshold: 0.15,
    animationDelay: 150
};

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation critique
    initScrollAnimations();
    initSmoothScroll();
    initHamburger();
    initContactForm();
    initBackToTop();
    initScrollProgress();
    initThemeToggle();
    initHeroGrid();

    // Initialisation différée
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initNavbarScroll();
        });
    } else {
        setTimeout(() => {
            initNavbarScroll();
        }, 2000);
    }
});

// ========================================
// HAMBURGER MENU (RESPONSIVE)
// ========================================

function initHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('main-nav');
    if (!btn || !nav) return;

    // Toggle open/close
    btn.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        btn.classList.toggle('is-open', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
    });

    // Close when a nav link is clicked
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });

    // Reset when resizing above breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            nav.classList.remove('nav-open');
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
}

// ========================================
// GESTION DU FORMULAIRE DE CONTACT
// ========================================

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        const currentLang = document.documentElement.lang || 'fr';
        const formData = new FormData(this);

        // Etat de chargement
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> ' + (currentLang === 'fr' ? 'Envoi en cours...' : (currentLang === 'en' ? 'Sending...' : 'Senden...'));

        try {
            const response = await fetch('https://formspree.io/f/mjgakkzw', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const successMsg = translations[currentLang]?.msg_success || 'Message envoyé !';
                showNotification(successMsg, 'success');
                contactForm.reset();

                // Réinitialiser les labels flottants
                document.querySelectorAll('.form-input').forEach(input => {
                    input.classList.remove('not-empty');
                });
            } else {
                const errorMsg = currentLang === 'fr' ? 'Erreur lors de l\'envoi.' : (currentLang === 'en' ? 'Error sending message.' : 'Fehler beim Senden.');
                showNotification(errorMsg, 'error');
            }
        } catch (error) {
            const errorMsg = currentLang === 'fr' ? 'Erreur de connexion.' : (currentLang === 'en' ? 'Connection error.' : 'Verbindungsfehler.');
            showNotification(errorMsg, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    });

    // Gérer l'état "not-empty" pour les labels flottants
    const inputs = contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (this.value) {
                this.classList.add('not-empty');
            } else {
                this.classList.remove('not-empty');
            }
        });
    });
}

// ========================================
// MODE CLAIR / SOMBRE
// ========================================

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');

    const sync = () => {
        const dark = root.getAttribute('data-theme') === 'dark';
        btn.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        btn.setAttribute('aria-label', dark ? 'Activer le mode clair' : 'Activer le mode sombre');
        btn.setAttribute('aria-pressed', String(dark));
        if (metaTheme) metaTheme.setAttribute('content', dark ? '#08111e' : '#f5f8fc');
    };

    btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('portfolio_theme', next); } catch (e) { /* stockage indisponible */ }
        sync();
    });

    // Suivre le réglage du système tant que l'utilisateur n'a pas choisi lui-même
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (e) => {
        let saved = null;
        try { saved = localStorage.getItem('portfolio_theme'); } catch (err) { /* ignore */ }
        if (saved) return;
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        sync();
    };
    if (media.addEventListener) media.addEventListener('change', onSystemChange);

    sync();
}

// ========================================
// CARREAUX ANIMÉS AUTOUR DU NOM (HERO)
// ========================================

function initHeroGrid() {
    const canvas = document.getElementById('hero-grid');
    const hero = canvas ? canvas.closest('.hero-section') : null;
    const name = document.getElementById('hero-name');
    if (!canvas || !hero || !name) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const CELL = 28; // doit correspondre au motif CSS (28px)
    const cells = [];
    let maxCells = 14;
    let zone = null;
    let running = false;
    let lastSpawn = 0;
    let frame = 0;
    let inView = true;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Zone en ellipse autour du nom, exprimée en cellules
        const heroRect = hero.getBoundingClientRect();
        const r = name.getBoundingClientRect();
        const margin = w < 600 ? 2 : 4;
        // Rectangles de texte à ne jamais recouvrir (nom, accroche, sous-titre)
        const texts = [name, ...hero.querySelectorAll('.hero-content h2, .hero-content p')].map(el => {
            const t = el.getBoundingClientRect();
            return { left: t.left - heroRect.left - 4, right: t.right - heroRect.left + 4, top: t.top - heroRect.top - 4, bottom: t.bottom - heroRect.top + 4 };
        });
        zone = {
            cx: r.left - heroRect.left + r.width / 2,
            cy: r.top - heroRect.top + r.height / 2,
            rx: r.width / 2 + CELL * margin,
            ry: r.height / 2 + CELL * (margin + 1),
            texts
        };
        maxCells = w < 600 ? 7 : 14;
    }

    function spawn(now) {
        for (let attempt = 0; attempt < 20; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random());
            const x = zone.cx + Math.cos(angle) * zone.rx * dist;
            const y = zone.cy + Math.sin(angle) * zone.ry * dist;
            const col = Math.floor(x / CELL);
            const row = Math.floor(y / CELL);
            const px = col * CELL;
            const py = row * CELL;

            // Les cellules entourent le nom sans passer sous les lettres
            const overName = zone.texts.some(n => px + CELL > n.left && px < n.right && py + CELL > n.top && py < n.bottom);
            const taken = cells.some(c => c.col === col && c.row === row);
            if (overName || taken || px < 0 || py < 0) continue;

            cells.push({ col, row, born: now, life: 2400 + Math.random() * 1800, peak: 0.55 + Math.random() * 0.45 });
            return;
        }
    }

    function draw(now) {
        if (!running) return;
        frame = requestAnimationFrame(draw);

        if (cells.length < maxCells && now - lastSpawn > 260) {
            spawn(now);
            lastSpawn = now;
        }

        const alphaMax = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t-cell-alpha')) || 0.2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = cells.length - 1; i >= 0; i--) {
            const c = cells[i];
            const t = (now - c.born) / c.life;
            if (t >= 1) {
                cells.splice(i, 1);
                continue;
            }
            const a = Math.sin(Math.PI * t) * c.peak * alphaMax;
            const x = c.col * CELL + 1;
            const y = c.row * CELL + 1;
            ctx.fillStyle = 'rgba(0, 128, 255, ' + a.toFixed(3) + ')';
            ctx.fillRect(x, y, CELL - 1, CELL - 1);
            ctx.strokeStyle = 'rgba(0, 128, 255, ' + Math.min(a * 2, 0.6).toFixed(3) + ')';
            ctx.strokeRect(x - 0.5, y - 0.5, CELL, CELL);
        }
    }

    function start() {
        if (running) return;
        running = true;
        frame = requestAnimationFrame(draw);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', debounce(resize, 150));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    // Recalcule après l'animation d'entrée du nom
    setTimeout(resize, 900);

    // Pause quand le hero n'est plus visible ou que l'onglet est masqué
    new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        inView ? start() : stop();
    }).observe(hero);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (inView) start();
    });
}

// ========================================
// ANIMATIONS AU SCROLL
// ========================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: CONFIG.scrollThreshold,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    // Animer les barres de skills dans cet élément
                    animateSkillBars(entry.target);
                    // Animer les compteurs de stats
                    animateStatCounters(entry.target);
                }, delay);
            }
        });
    }, observerOptions);

    // Observer les éléments à animer
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));

    // Observer les titres de section
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => observer.observe(title));
}

// ========================================
// ANIMATION DES BARRES DE COMPÉTENCES
// ========================================

function animateSkillBars(container) {
    // Si le container est une skills-category, animer ses barres
    const bars = container.querySelectorAll('.skill-bar-fill');
    bars.forEach((bar, index) => {
        const targetWidth = bar.getAttribute('data-width') || 0;
        const skillItem = bar.closest('.skill-item');
        setTimeout(() => {
            bar.style.width = targetWidth + '%';
            if (skillItem) {
                skillItem.classList.add('animated');
            }
        }, index * 120);
    });
}

// ========================================
// COMPTEURS DE STATISTIQUES ANIMÉS
// ========================================

function animateStatCounters(container) {
    const statNumber = container.querySelector('.stat-number[data-target]');
    if (!statNumber) return;

    const target = parseInt(statNumber.getAttribute('data-target'), 10);
    const duration = 1200;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            statNumber.textContent = target + (statNumber.hasAttribute('data-plus') ? '+' : '');
            clearInterval(timer);
        } else {
            statNumber.textContent = Math.floor(current);
        }
    }, 16);
}

// ========================================
// BACK TO TOP BUTTON
// ========================================

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========================================
// SCROLL PROGRESS BAR
// ========================================

function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    }, { passive: true });
}


// ========================================
// SMOOTH SCROLL
// ========================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80; // Offset pour la navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// NAVBAR AU SCROLL
// ========================================

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Ajouter une ombre au scroll
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        }

        // Cacher/montrer la navbar en fonction du scroll
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });

    // Transition smooth pour la navbar
    navbar.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
}

// ========================================
// SYSTÈME DE NOTIFICATIONS
// ========================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.4s ease-out;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Ajouter les animations de notification au CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(notificationStyles);

// ========================================
// ANIMATION DES COMPTEURS (OPTIONNEL)
// ========================================

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// ========================================
// UTILITAIRES
// ========================================

// Animation spectaculaire du titre Hero
function initHeroAnimation() {
    const heroTitle = document.querySelector('.text-reveal');
    if (!heroTitle) return;

    // Attendre que l'animation principale soit terminée
    setTimeout(() => {
        // Ajouter la classe animated (sans effet de clignotement)
        heroTitle.classList.add('animated');

        // Créer des particules d'explosion autour du titre
        createTitleExplosion(heroTitle);
    }, 2500);

    // ENLEVER l'effet de scintillement - plus de clignotement !
}

// Créer une explosion de particules autour du titre
function createTitleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Créer 30 particules
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: ${8 + Math.random() * 12}px;
            height: ${8 + Math.random() * 12}px;
            background: ${i % 2 === 0 ? '#ffffff' : '#8E24AA'};
            border-radius: 50%;
            left: ${centerX}px;
            top: ${centerY}px;
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 0 20px ${i % 2 === 0 ? '#ffffff' : '#8E24AA'};
        `;

        document.body.appendChild(particle);

        // Animation de l'explosion
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 100 + Math.random() * 200;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        const animation = particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${tx}px, ${ty}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 1000 + Math.random() * 500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        animation.onfinish = () => particle.remove();
    }

    // Créer un flash de lumière plus doux
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at ${centerX}px ${centerY}px, 
            rgba(255, 255, 255, 0.3) 0%,
            rgba(106, 27, 154, 0.2) 30%, 
            transparent 50%);
        pointer-events: none;
        z-index: 9998;
    `;
    document.body.appendChild(flash);

    flash.animate([
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    }).onfinish = () => flash.remove();
}

// Effets 3D sur les boxes
function init3DEffects() {
    const boxes = document.querySelectorAll('.feature-item, .step-item, .testimonial-item');

    boxes.forEach(box => {
        box.addEventListener('mousemove', (e) => {
            const rect = box.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            box.style.transform = `
                perspective(1000px)
                translateZ(30px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.05)
            `;
        });

        box.addEventListener('mouseleave', () => {
            box.style.transform = 'perspective(1000px) translateZ(0) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Debounce pour optimiser les performances
function debounce(func, wait = 20) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle pour les événements scroll
function throttle(func, limit = 100) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
