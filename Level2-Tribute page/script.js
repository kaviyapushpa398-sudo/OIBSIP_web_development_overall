/* ============================================================
   SUNDAR PICHAI — TRIBUTE PAGE  |  script.js
   Handles: navbar scroll, scroll-reveal animations,
            mobile nav toggle, smooth-scroll, active nav links
   ============================================================ */

'use strict';

// ── 1. NAVBAR — shrink on scroll ────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });


// ── 2. MOBILE NAV TOGGLE ────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
  // Prevent body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.body.style.overflow = '';
  });
});


// ── 3. SCROLL REVEAL (Intersection Observer) ────────────────
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, no need to observe anymore
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  }
);

revealElements.forEach(el => revealObserver.observe(el));


// ── 4. ACTIVE NAV LINK HIGHLIGHT ON SCROLL ──────────────────
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinkEls = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--gold)';
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));


// ── 5. SMOOTH SCROLL for hero CTA ────────────────────────────
// (handled by CSS scroll-behavior: smooth, but JS fallback below)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ── 6. HERO IMAGE — parallax tilt on mouse move ─────────────
const heroImgWrap = document.querySelector('.hero-image-wrap');
const heroImg     = heroImgWrap ? heroImgWrap.querySelector('.hero-img') : null;

if (heroImgWrap && heroImg) {
  heroImgWrap.addEventListener('mousemove', (e) => {
    const rect   = heroImgWrap.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / rect.width;
    const dy     = (e.clientY - cy) / rect.height;
    const tiltX  = -(dy * 14).toFixed(2);
    const tiltY  =  (dx * 14).toFixed(2);
    heroImg.style.transform = `scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });

  heroImgWrap.addEventListener('mouseleave', () => {
    heroImg.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
    heroImg.style.transition = 'transform 0.5s ease';
  });

  heroImgWrap.addEventListener('mouseenter', () => {
    heroImg.style.transition = 'transform 0.1s ease';
  });
}


// ── 7. STATS COUNTER ANIMATION ──────────────────────────────
function animateCounter(el) {
  const text    = el.textContent.trim();
  const numPart = parseFloat(text.replace(/[^0-9.]/g, ''));
  const suffix  = text.replace(/[0-9.]/g, '');
  if (isNaN(numPart)) return;

  const duration = 1400;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const ease     = 1 - Math.pow(1 - progress, 3);
    const value    = numPart * ease;
    el.textContent = (Number.isInteger(numPart)
      ? Math.round(value)
      : value.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const statNums = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
statNums.forEach(el => counterObserver.observe(el));


// ── 8. CAREER CARD SUBTLE GLOW on hover ─────────────────────
document.querySelectorAll('.career-card, .achieve-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top ) / rect.height * 100).toFixed(1);
    card.style.backgroundImage =
      `radial-gradient(circle at ${x}% ${y}%, rgba(201,168,76,0.06), transparent 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.backgroundImage = '';
  });
});


// ── 9. PAGE LOAD entrance — reveal hero immediately ─────────
window.addEventListener('DOMContentLoaded', () => {
  // Force-trigger reveals for elements already in viewport on load
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      el.classList.add('visible');
    }
  });
});
