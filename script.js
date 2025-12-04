// AlemX FTC Website - Main JavaScript
// Follows strict no-blocking initialization rules

(function() {
  'use strict';

  // ===== STATE =====
  let currentLang = 'en';
  let translations = null;
  let isIntroActive = true;

  // ===== UTILITY FUNCTIONS =====
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Check if user prefers reduced motion
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // ===== INTRO SCREEN =====
  function initIntro() {
    const intro = $('#intro-screen');
    if (!intro) return;

    let introCloseTimer = null;

    const closeIntro = () => {
      if (!isIntroActive) return;
      isIntroActive = false;
      
      clearTimeout(introCloseTimer);
      intro.classList.add('closing');
      
      setTimeout(() => {
        intro.classList.add('hidden');
        document.body.style.overflow = '';
        initScrollAnimations();
        animateHeroElements();
      }, prefersReducedMotion() ? 10 : 800);
    };

    // Auto-close fallback after 6 seconds
    introCloseTimer = setTimeout(closeIntro, 6000);

    // Click to close
    intro.addEventListener('click', closeIntro);

    // Keyboard close (Enter or Space)
    intro.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeIntro();
      }
    });

    // Prevent body scroll while intro is active
    document.body.style.overflow = 'hidden';
  }

  // ===== HERO ANIMATIONS =====
  function animateHeroElements() {
    const words = $$('.hero-title .word');
    const subtitle = $('.hero-subtitle');
    const cta = $('.hero-cta');
    const hero3d = $('.hero-3d-slot');

    if (prefersReducedMotion()) {
      words.forEach(word => {
        word.style.opacity = '1';
        word.style.transform = 'none';
      });
      if (subtitle) {
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'none';
      }
      if (cta) {
        cta.style.opacity = '1';
        cta.style.transform = 'none';
      }
      if (hero3d) {
        hero3d.style.opacity = '1';
      }
      return;
    }

    words.forEach((word, index) => {
      setTimeout(() => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
        word.style.transition = 'all 0.6s cubic-bezier(0.33, 1, 0.68, 1)';
      }, index * 100);
    });

    if (subtitle) {
      setTimeout(() => {
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
        subtitle.style.transition = 'all 0.9s cubic-bezier(0.33, 1, 0.68, 1)';
      }, words.length * 100);
    }

    if (cta) {
      setTimeout(() => {
        cta.style.opacity = '1';
        cta.style.transform = 'translateY(0)';
        cta.style.transition = 'all 0.9s cubic-bezier(0.33, 1, 0.68, 1)';
      }, words.length * 100 + 200);
    }

    if (hero3d) {
      setTimeout(() => {
        hero3d.style.opacity = '1';
        hero3d.style.transition = 'opacity 1.2s ease-out';
      }, words.length * 100 + 400);
    }
  }

  // ===== THEME TOGGLE =====
  function initTheme() {
    const themeToggle = $('#theme-toggle');
    if (!themeToggle) return;

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Add ripple effect
      if (!prefersReducedMotion()) {
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
          themeToggle.style.transform = '';
        }, 150);
      }
    });
  }


  
  // ===== LANGUAGE TOGGLE =====
  async function loadTranslations() {
    try {
      const enResponse = await fetch('i18n/en.json');
      const ruResponse = await fetch('i18n/ru.json');
      
      translations = {
        en: await enResponse.json(),
        ru: await ruResponse.json()
      };
    } catch (error) {
      console.warn('Translation files not found, using default text');
      translations = null;
    }
  }

  function translatePage(lang) {
    if (!translations || !translations[lang]) return;

    const elements = $$('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const keys = key.split('.');
      let value = translations[lang];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      if (value) {
        element.textContent = value;
      }
    });
  }

  function initLanguageToggle() {
    const langToggle = $('#lang-toggle');
    if (!langToggle) return;

    // Detect browser language
    const browserLang = navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
    currentLang = localStorage.getItem('language') || browserLang;
    
    loadTranslations().then(() => {
      translatePage(currentLang);
      updateLangButton();
    });

    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ru' : 'en';
      localStorage.setItem('language', currentLang);
      translatePage(currentLang);
      updateLangButton();
    });
  }

  function updateLangButton() {
    const langCurrent = $('.lang-current');
    if (langCurrent) {
      langCurrent.textContent = currentLang.toUpperCase();
    }
  }

  // ===== NAVIGATION =====
  function initNavigation() {
    const navLinks = $$('.nav-menu a');
    const mobileToggle = $('.mobile-menu-toggle');
    const navMenu = $('.nav-menu');
    const pageTransition = $('.page-transition-overlay');

    // Smooth scroll with page transition
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const target = $(`#${targetId}`);
          
          if (target) {
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('mobile-active')) {
              navMenu.classList.remove('mobile-active');
              mobileToggle?.setAttribute('aria-expanded', 'false');
            }

            // Page transition effect
            if (pageTransition && !prefersReducedMotion()) {
              pageTransition.classList.add('active');
              setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                  pageTransition.classList.remove('active');
                }, 400);
              }, 400);
            } else {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
      });
    });

    // Mobile menu toggle
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        navMenu.classList.toggle('mobile-active');
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
      });
    }

    // Active link highlighting on scroll
    const updateActiveLink = () => {
      const sections = $$('section[id]');
      const scrollY = window.pageYOffset;

      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', debounce(updateActiveLink, 100));
  }

  // ===== SCROLL ANIMATIONS =====
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: make all elements visible
      $$('.reveal-element').forEach(el => el.classList.add('visible'));
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    $$('.reveal-element').forEach(element => {
      observer.observe(element);
    });
  }

  // ===== MODALS =====
  const modalData = {
    projects: {
      1: {
        title: 'Autonomous Navigation System',
        description: 'Our flagship autonomous navigation system uses advanced computer vision and machine learning algorithms to navigate complex environments. The system features real-time obstacle detection, path planning, and adaptive decision-making capabilities.',
        features: ['Real-time SLAM', 'LiDAR integration', 'Vision-based localization', 'Dynamic path planning'],
        tech: ['Python', 'TensorFlow', 'ROS', 'OpenCV']
      },
      2: {
        title: 'Smart Manufacturing Assistant',
        description: 'Industrial robotics platform designed for manufacturing environments. Features predictive maintenance, quality control, and automated assembly processes. Reduces downtime by 40% through AI-powered diagnostics.',
        features: ['Predictive maintenance', 'Quality control AI', 'Automated assembly', 'Real-time monitoring'],
        tech: ['C++', 'PyTorch', 'Industrial IoT', 'Computer Vision']
      },
      3: {
        title: 'Vision Recognition Platform',
        description: 'State-of-the-art object detection and classification system capable of identifying thousands of objects in real-time. Used in various applications from security to inventory management.',
        features: ['Real-time detection', 'Multi-class classification', 'Edge deployment', '99.2% accuracy'],
        tech: ['Python', 'YOLO', 'TensorRT', 'CUDA']
      }
    },
    team: {
      founder1: {
        name: 'Alex Chen',
        role: 'Co-Founder & Chief Engineer',
        bio: 'Alex has over 10 years of experience in robotics engineering and autonomous systems. Previously led the robotics division at a Fortune 500 tech company. Holds a Ph.D. in Mechanical Engineering from MIT.',
        projects: ['Autonomous Navigation System', 'Manufacturing Assistant'],
        skills: ['Robotics', 'Control Systems', 'AI Integration', 'Team Leadership']
      },
      founder2: {
        name: 'Sarah Williams',
        role: 'Co-Founder & AI Director',
        bio: 'Sarah is a leading researcher in machine learning and computer vision. Published 30+ papers in top AI conferences. Former research scientist at a major AI lab. Ph.D. in Computer Science from Stanford.',
        projects: ['Vision Recognition Platform', 'Deep Learning Pipeline'],
        skills: ['Machine Learning', 'Computer Vision', 'Deep Learning', 'Research']
      }
    }
  };

  function openProjectModal(projectId) {
    const modal = $('#project-modal');
    const modalBody = $('#modal-body');
    if (!modal || !modalBody) return;

    const project = modalData.projects[projectId];
    if (!project) return;

    modalBody.innerHTML = `
      <h2 id="modal-title">${project.title}</h2>
      <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">${project.description}</p>
      
      <h3 style="margin-top: var(--spacing-md); margin-bottom: var(--spacing-sm);">Key Features</h3>
      <ul style="color: var(--text-secondary); margin-bottom: var(--spacing-md); padding-left: var(--spacing-md);">
        ${project.features.map(f => `<li style="margin-bottom: var(--spacing-xs);">${f}</li>`).join('')}
      </ul>
      
      <h3 style="margin-bottom: var(--spacing-sm);">Technologies</h3>
      <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap;">
        ${project.tech.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on close button for accessibility
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function openTeamModal(memberId) {
    const modal = $('#team-modal');
    const modalBody = $('#team-modal-body');
    if (!modal || !modalBody) return;

    const member = modalData.team[memberId];
    if (!member) {
      // For members without detailed data
      modalBody.innerHTML = `
        <h2 id="team-modal-title">Team Member Profile</h2>
        <p style="color: var(--text-secondary);">Detailed profile coming soon.</p>
      `;
    } else {
      modalBody.innerHTML = `
        <h2 id="team-modal-title">${member.name}</h2>
        <p style="color: var(--accent-primary); font-weight: 600; margin-bottom: var(--spacing-md);">${member.role}</p>
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md); line-height: 1.8;">${member.bio}</p>
        
        ${member.projects ? `
          <h3 style="margin-bottom: var(--spacing-sm);">Key Projects</h3>
          <ul style="color: var(--text-secondary); margin-bottom: var(--spacing-md); padding-left: var(--spacing-md);">
            ${member.projects.map(p => `<li style="margin-bottom: var(--spacing-xs);">${p}</li>`).join('')}
          </ul>
        ` : ''}
        
        ${member.skills ? `
          <h3 style="margin-bottom: var(--spacing-sm);">Expertise</h3>
          <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap;">
            ${member.skills.map(s => `<span class="tag">${s}</span>`).join('')}
          </div>
        ` : ''}
      `;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function initModals() {
    const projectModal = $('#project-modal');
    const teamModal = $('#team-modal');

    // Project modal triggers
    $$('.project-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('[data-project]');
        if (card) {
          const projectId = card.getAttribute('data-project');
          openProjectModal(projectId);
        }
      });
    });

    // Team modal triggers
    $$('.team-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('[data-member]');
        if (card) {
          const memberId = card.getAttribute('data-member');
          openTeamModal(memberId);
        }
      });
    });

    // Close buttons
    $$('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        closeModal(modal);
      });
    });

    // Close on overlay click
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', () => {
        const modal = overlay.closest('.modal');
        closeModal(modal);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (projectModal?.classList.contains('active')) {
          closeModal(projectModal);
        }
        if (teamModal?.classList.contains('active')) {
          closeModal(teamModal);
        }
      }
    });

    // Trap focus in modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const activeModal = $('.modal.active');
        if (activeModal) {
          const focusableElements = activeModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  // ===== CARD TILT EFFECT =====
  function initCardTilt() {
    if (prefersReducedMotion()) return;
    if (window.innerWidth < 768) return; // Skip on mobile

    const cards = [...$$('.project-card'), ...$$('.team-card')];

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ===== BUTTON RIPPLE EFFECT =====
  function initButtonRipples() {
    if (prefersReducedMotion()) return;

    $$('.btn').forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ===== PARALLAX EFFECT =====
  function initParallax() {
    if (prefersReducedMotion()) return;

    const hero3d = $('.hero-3d-slot');
    if (!hero3d) return;

    let ticking = false;

    window.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 20;
          const y = (e.clientY / window.innerHeight - 0.5) * 20;
          
          if (hero3d) {
            hero3d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ===== INITIALIZATION =====
  function init() {
    // Initialize on DOMContentLoaded
    initIntro();
    initTheme();
    initLanguageToggle();
    initNavigation();
    initModals();
    initCardTilt();
    initButtonRipples();
    initParallax();

    // Scroll animations will be initialized after intro closes
    if (!isIntroActive) {
      initScrollAnimations();
      animateHeroElements();
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

