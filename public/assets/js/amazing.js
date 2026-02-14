// Import required libraries
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// ============================================================================
// SCROLL PROGRESS
// ============================================================================
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (window.scrollY / scrollHeight) * 100;
    progressBar.style.width = scrollProgress + '%';
  });
}

// ============================================================================
// CUSTOM CURSOR
// ============================================================================
function initCustomCursor() {
  const cursorOrb = document.querySelector('.cursor-orb');
  const cursorTrail = document.querySelector('.cursor-trail');
  const trailParticles = [];
  const maxTrailLength = 20;
  
  // Global mouse position
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor position
    gsap.to(cursorOrb, {
      left: mouseX - 10,
      top: mouseY - 10,
      duration: 0.1
    });
    
    // Create trail particles
    if (Math.random() > 0.7) {
      createTrailParticle(mouseX, mouseY);
    }
  });
  
  function createTrailParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'trail-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);
    
    trailParticles.push(particle);
    
    gsap.to(particle, {
      opacity: 0,
      y: y + 30,
      x: x + (Math.random() - 0.5) * 50,
      duration: 1,
      onComplete: () => {
        particle.remove();
        trailParticles.splice(trailParticles.indexOf(particle), 1);
      }
    });
    
    if (trailParticles.length > maxTrailLength) {
      const old = trailParticles.shift();
      old.remove();
    }
  }
  
  // Cursor size change on hover
  document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('btn')) {
      gsap.to(cursorOrb, { scale: 1.5, duration: 0.3 });
    } else if (e.target.classList.contains('nav-link')) {
      gsap.to(cursorOrb, { scale: 0.8, duration: 0.3 });
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    gsap.to(cursorOrb, { scale: 1, duration: 0.3 });
  });
  
  // Store for use in other functions
  window.mouseX = mouseX;
  window.mouseY = mouseY;
}

// ============================================================================
// THREE.JS 3D SCENE
// ============================================================================
function initThreeJS() {
  const canvas = document.getElementById('threejs-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  camera.position.z = 30;
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0x8B5CF6, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
  
  // Create floating particles
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = (Math.random() - 0.5) * 100;
    positions[i + 2] = (Math.random() - 0.5) * 100;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x8B5CF6,
    size: 0.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles
    particles.rotation.x += 0.0001;
    particles.rotation.y += 0.0002;
    
    // Mouse tracking
    if (window.mouseX && window.mouseY) {
      camera.position.x += (window.mouseX / window.innerWidth - 0.5) * 0.5;
      camera.position.y -= (window.mouseY / window.innerHeight - 0.5) * 0.5;
    }
    
    // Scroll zoom
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    camera.position.z = 30 - scrollPercent * 20;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ============================================================================
// HERO ANIMATIONS
// ============================================================================
function initHeroAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  
  // Hero title letter animations
  const heroWords = document.querySelectorAll('.hero-word');
  
  const timeline = gsap.timeline();
  
  heroWords.forEach((word, index) => {
    timeline.from(word, {
      duration: 1,
      opacity: 0,
      scale: 0,
      rotationZ: Math.random() * 360 - 180,
      ease: 'back.out(2)'
    }, index * 0.3);
  });
}

// ============================================================================
// BUTTON INTERACTIONS
// ============================================================================
function initButtonInteractions() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Ripple effect
      createRipple(this, x, y);
      
      // Particle burst
      createButtonBurst(e.clientX, e.clientY);
    });
    
    btn.addEventListener('mouseenter', function() {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.3,
        overwrite: 'auto'
      });
    });
    
    btn.addEventListener('mouseleave', function() {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        overwrite: 'auto'
      });
    });
  });
}

function createRipple(element, x, y) {
  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.style.width = '1px';
  ripple.style.height = '1px';
  ripple.style.background = 'rgba(255, 255, 255, 0.5)';
  ripple.style.borderRadius = '50%';
  ripple.style.pointerEvents = 'none';
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  gsap.to(ripple, {
    width: 400,
    height: 400,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: () => ripple.remove()
  });
}

function createButtonBurst(x, y) {
  const colors = ['#8B5CF6', '#00F5D4', '#FF006E'];
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '10000';
    document.body.appendChild(particle);
    
    const angle = (i / particleCount) * Math.PI * 2;
    const velocity = 5 + Math.random() * 5;
    const tx = Math.cos(angle) * velocity * 100;
    const ty = Math.sin(angle) * velocity * 100;
    
    gsap.to(particle, {
      left: x + tx,
      top: y + ty,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => particle.remove()
    });
  }
}

// ============================================================================
// HASHTAG INTERACTIONS
// ============================================================================
function initHashtagInteractions() {
  document.querySelectorAll('.hashtag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      // Create burst
      const rect = chip.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createHashtagBurst(x, y);
      
      // Rearrange chips
      rearrangeHashtags();
    });
  });
}

function createHashtagBurst(x, y) {
  const shockwaveRings = 3;
  
  for (let ring = 0; ring < shockwaveRings; ring++) {
    const rings = document.createElement('div');
    rings.style.position = 'fixed';
    rings.style.left = x + 'px';
    rings.style.top = y + 'px';
    rings.style.width = '20px';
    rings.style.height = '20px';
    rings.style.border = '2px solid #00F5D4';
    rings.style.borderRadius = '50%';
    rings.style.pointerEvents = 'none';
    rings.style.zIndex = '9999';
    rings.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(rings);
    
    gsap.to(rings, {
      width: 200 + ring * 100,
      height: 200 + ring * 100,
      opacity: 0,
      duration: 1 + ring * 0.2,
      ease: 'power2.out',
      onComplete: () => rings.remove(),
      delay: ring * 0.1
    });
  }
}

function rearrangeHashtags() {
  const hashtags = document.querySelectorAll('.hashtag-chip');
  const positions = [];
  
  hashtags.forEach((chip, i) => {
    const randomX = (Math.random() - 0.5) * 100;
    const randomY = (Math.random() - 0.5) * 100;
    
    gsap.to(chip, {
      x: randomX,
      y: randomY,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });
    
    setTimeout(() => {
      gsap.to(chip, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)'
      });
    }, 300);
  });
}

// ============================================================================
// LIVE COUNTER ANIMATIONS
// ============================================================================
function initLiveCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        
        const target = parseInt(entry.target.dataset.target);
        const duration = 2;
        const start = Date.now();
        
        function update() {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(target * easeProgress);
          
          entry.target.textContent = current.toLocaleString();
          
          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }
        
        update();
      }
    });
  }, { threshold: 0.5 });
  
  document.querySelectorAll('.live-count').forEach(el => observer.observe(el));
}

// ============================================================================
// CARD TILT EFFECT (Vanilla Tilt)
// ============================================================================
function initCardTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  VanillaTilt.init(cards, {
    max: 10,
    scale: 1.03,
    speed: 400,
    glare: true,
    'glare-opacity': 0.2
  });
}

// ============================================================================
// SMOOTH SCROLL
// ============================================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          gsap.to(window, {
            scrollTo: { y: target, offsetY: 80 },
            duration: 1,
            ease: 'power3.inOut'
          });
        }
      }
    });
  });
}

// ============================================================================
// SOUND TOGGLE
// ============================================================================
function initSoundToggle() {
  const soundBtn = document.querySelector('.sound-toggle');
  let soundEnabled = false;
  
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.style.opacity = soundEnabled ? '1' : '0.5';
    window.soundEnabled = soundEnabled;
  });
}

// ============================================================================
// PAGE LOAD SEQUENCE
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Wait for preloader to finish
  setTimeout(() => {
    initScrollProgress();
    initCustomCursor();
    initThreeJS();
    initHeroAnimations();
    initButtonInteractions();
    initHashtagInteractions();
    initLiveCounters();
    initCardTilt();
    initSmoothScroll();
    initSoundToggle();
  }, 100);
});

// ============================================================================
// MOUSE EVENT TRACKING FOR THREE.JS
// ============================================================================
document.addEventListener('mousemove', (e) => {
  window.mouseX = e.clientX;
  window.mouseY = e.clientY;
});

// ============================================================================
// SCROLL TRIGGER ANIMATIONS
// ============================================================================
gsap.registerPlugin(ScrollTrigger);

// Animate dashboard cards on scroll
gsap.utils.toArray('.dashboard-card').forEach((card, index) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top bottom',
      end: 'top center',
      scrub: 1,
      markers: false
    },
    opacity: 0,
    y: 100,
    duration: 1,
    delay: index * 0.1
  });
});

// Animate feature cards
gsap.utils.toArray('.feature-card').forEach((card, index) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top bottom-=50px',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 50,
    duration: 0.8,
    delay: index * 0.15
  });
});
