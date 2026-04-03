// ========================================
// YOWYOB FEEDBACK - ANIMATIONS MODERNES
// ========================================

'use strict';

// Configuration
const CONFIG = {
    particleCount: 80,
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

    // Initialisation différée
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initParticles();
            initNavbarScroll();
            initParallax();
        });
    } else {
        setTimeout(() => {
            initParticles();
            initNavbarScroll();
            initParallax();
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
// SYSTÈME DE PARTICULES
// ========================================

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Position aléatoire
    const startX = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 100;
    const duration = 10 + Math.random() * 20;
    const delay = Math.random() * 5;
    const size = 2 + Math.random() * 4;

    particle.style.left = `${startX}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.setProperty('--drift', `${drift}px`);

    container.appendChild(particle);

    // Régénérer la particule après l'animation
    particle.addEventListener('animationiteration', () => {
        particle.style.left = `${Math.random() * 100}%`;
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
// GESTION DU FORMULAIRE DE CONNEXION
// ========================================

function handleLogin(form) {
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    // Animation de chargement
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Connexion...';

    // Simuler une requête (remplacer par votre logique)
    setTimeout(() => {
        console.log('Login attempt:', { email, password });
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        // Afficher un message de succès
        showNotification('Connexion réussie !', 'success');
        closeModal(document.getElementById('loginModal'));
    }, 1500);
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
// EFFET PARALLAXE
// ========================================

function initParallax() {
    if (window.innerWidth < 768) return; // Désactiver sur mobile

    const parallaxElements = document.querySelectorAll('.feature-item, .step-item, .testimonial-item');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const distance = (centerY - viewportCenter) / 50;

            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.transform = `translateY(${distance}px)`;
            }
        });
    });
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

// ========================================
// EASTER EGG (optionnel)
// ========================================

let clickCount = 0;
document.querySelector('.footer-logo')?.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 5) {
        createConfetti();
        showNotification('🎉 Vous avez trouvé l\'easter egg !', 'success');
        clickCount = 0;
    }
});

function createConfetti() {
    const colors = ['#6A1B9A', '#8E24AA', '#AB47BC', '#CE93D8'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: 1;
            transform: rotate(${Math.random() * 360}deg);
            pointer-events: none;
            z-index: 10001;
        `;

        document.body.appendChild(confetti);

        const animation = confetti.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${720 + Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 3000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        animation.onfinish = () => confetti.remove();
    }
}

// ========================================
// EXPORT (si module ES6)
// ========================================
// ... (à l'intérieur de la fonction initModal, cherchez le formulaire) ...

// Gestionnaire de soumission du formulaire de connexion
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Simuler la connexion et la redirection
        showNotification('Connexion réussie ! Redirection...', 'success');

        // Masquer la modale
        loginModal.classList.remove('show');

        // Redirection vers le tableau de bord après un court délai
        setTimeout(() => {
            window.location.href = 'dashboard.html'; // C'est ici que la redirection se fait
        }, 1500); // Délai de 1.5 secondes pour que l'utilisateur lise la notification
    });
}

// ... (le reste du fichier script.js) ...
// export { showNotification, animateCounter, debounce, throttle };
