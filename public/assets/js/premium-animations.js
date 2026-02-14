// ============================================
// VIRALCLIP PREMIUM ANIMATIONS
// Parallax, scroll reveals, stat counters
// ============================================

(function() {
  'use strict';

  // ============================================
  // SMOOTH SCROLL BEHAVIOR
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
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
  }

  // ============================================
  // PARALLAX SCROLL EFFECT
  // Uses data-speed attribute for layer velocity
  // ============================================
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-speed]');
    
    if (parallaxElements.length === 0) return;
    
    let ticking = false;
    
    function updateParallax() {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.5;
        const yPos = -(scrolled * speed);
        
        // Use transform for better performance
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
      
      ticking = false;
    }
    
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial update
    updateParallax();
  }

  // ============================================
  // INTERSECTION OBSERVER FOR SCROLL REVEALS
  // Triggers animation classes when elements enter viewport
  // ============================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal, .glass-card, .trust, .footer');
    
    if (revealElements.length === 0) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add reveal class
          entry.target.classList.add('revealed');
          entry.target.classList.add('reveal');
          
          // Unobserve after reveal (one-time animation)
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    revealElements.forEach(el => observer.observe(el));
  }

  // ============================================
  // STAT COUNTER ANIMATION
  // Animates numbers from 0 to target with easing
  // ============================================
  function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length === 0) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    function animateCounter(element, target, duration = 2000) {
      const start = 0;
      const increment = target / (duration / 16); // 60fps
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        
        // Format number with commas
        const formatted = Math.floor(current).toLocaleString();
        
        // Preserve suffix if exists (M, K, +, etc)
        const suffix = element.getAttribute('data-suffix') || '';
        element.textContent = formatted + suffix;
      }, 16);
    }
    
    function easeOutQuad(t) {
      return t * (2 - t);
    }
    
    function animateCounterWithEasing(element, target, duration = 2000) {
      const startTime = performance.now();
      
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const current = Math.floor(easedProgress * target);
        
        // Format number with commas
        const formatted = current.toLocaleString();
        
        // Preserve suffix if exists
        const suffix = element.getAttribute('data-suffix') || '';
        element.textContent = formatted + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      
      requestAnimationFrame(update);
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const targetText = element.getAttribute('data-count') || element.textContent;
          
          // Extract number and suffix
          const match = targetText.match(/^([\d,]+)(.*)$/);
          if (match) {
            const targetNumber = parseInt(match[1].replace(/,/g, ''));
            const suffix = match[2].trim();
            
            element.setAttribute('data-suffix', suffix);
            animateCounterWithEasing(element, targetNumber, 2000);
          }
          
          observer.unobserve(element);
        }
      });
    }, observerOptions);
    
    statNumbers.forEach(el => observer.observe(el));
  }

  // ============================================
  // BUTTON RIPPLE EFFECT
  // Material-style ripple on click
  // ============================================
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ============================================
  // NAVBAR SCROLL BEHAVIOR
  // Enhanced backdrop blur on scroll
  // ============================================
  function initNavbarScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    let ticking = false;
    
    function updateNavbar() {
      const scrolled = window.pageYOffset;
      
      if (scrolled > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
      } else {
        nav.style.background = 'rgba(255, 255, 255, 0.85)';
        nav.style.boxShadow = 'none';
      }
      
      ticking = false;
    }
    
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }

  // ============================================
  // CURSOR TRAIL EFFECT (PREMIUM TOUCH)
  // Subtle particle trail following cursor
  // ============================================
  function initCursorTrail() {
    // Only enable on desktop
    if (window.innerWidth < 1024) return;
    
    const trail = [];
    const trailLength = 5;
    
    document.addEventListener('mousemove', (e) => {
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.left = e.pageX + 'px';
      particle.style.top = e.pageY + 'px';
      
      document.body.appendChild(particle);
      trail.push(particle);
      
      if (trail.length > trailLength) {
        const oldParticle = trail.shift();
        oldParticle.remove();
      }
      
      setTimeout(() => {
        particle.style.opacity = '0';
        particle.style.transform = 'scale(0)';
      }, 10);
      
      setTimeout(() => particle.remove(), 500);
    });
    
    // Add cursor particle styles
    const style = document.createElement('style');
    style.textContent = `
      .cursor-particle {
        position: absolute;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, rgba(127, 58, 242, 0.4), transparent);
        border-radius: 50%;
        pointer-events: none;
        transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // FLOATING ICON RANDOMIZATION
  // Adds slight random variation to float animation delays
  // ============================================
  function initFloatingIcons() {
    const floatIcons = document.querySelectorAll('.float-icon');
    
    floatIcons.forEach((icon, index) => {
      const randomDelay = Math.random() * 2;
      const randomDuration = 5 + Math.random() * 3;
      
      icon.style.animationDelay = randomDelay + 's';
      icon.style.animationDuration = randomDuration + 's';
    });
  }

  // ============================================
  // GLASS CARD HOVER TILT
  // Subtle 3D tilt following mouse position
  // ============================================
  function initGlassCardTilt() {
    const cards = document.querySelectorAll('.glass-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
      });
    });
  }

  // ============================================
  // INITIALIZE ALL ANIMATIONS
  // Called when DOM is ready
  // ============================================
  function init() {
    console.log('🎨 ViralClip Premium Animations Initialized');
    
    initSmoothScroll();
    initParallax();
    initScrollReveal();
    initStatCounters();
    initButtonRipple();
    initNavbarScroll();
    initCursorTrail();
    initFloatingIcons();
    initGlassCardTilt();
  }

  // ============================================
  // AUTO-INITIALIZE ON DOM READY
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
