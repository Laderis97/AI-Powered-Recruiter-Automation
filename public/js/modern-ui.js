/**
 * Modern AI Recruiter UI - 2025 Design Trends
 * Features: AI-driven personalization, micro-interactions, motion design, and modern UX
 */

class ModernUI {
  constructor() {
    this.currentTheme = 'light';
    this.userPreferences = this.loadUserPreferences();
    this.animationsEnabled = this.checkAnimationSupport();
    this.initializeUI();
  }

  /**
   * Initialize the modern UI system
   */
  initializeUI() {
    this.setupThemeToggle();
    this.setupSmoothScrolling();
    this.setupIntersectionObserver();
    this.setupMicroInteractions();
    this.setupAIPersonalization();
    this.setupMotionDesign();
    this.setupResponsiveBehavior();
    this.setupAccessibility();
  }

  /**
   * Load user preferences from localStorage
   */
  loadUserPreferences() {
    const defaults = {
      theme: 'light',
      animations: true,
      fontSize: 'normal',
      contrast: 'normal',
      reducedMotion: false
    };

    try {
      const stored = localStorage.getItem('aiRecruiterPreferences');
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch (error) {
      console.warn('Could not load user preferences:', error);
      return defaults;
    }
  }

  /**
   * Save user preferences to localStorage
   */
  saveUserPreferences(preferences) {
    try {
      this.userPreferences = { ...this.userPreferences, ...preferences };
      localStorage.setItem('aiRecruiterPreferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.warn('Could not save user preferences:', error);
    }
  }

  /**
   * Check if animations are supported and enabled
   */
  checkAnimationSupport() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 
           this.userPreferences.animations && 
           !this.userPreferences.reducedMotion;
  }

  /**
   * Setup theme toggle with smooth transitions
   */
  setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    // Set initial theme
    this.setTheme(this.userPreferences.theme);

    themeToggle.addEventListener('click', () => {
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
      this.saveUserPreferences({ theme: newTheme });
    });

    // Add hover effects
    themeToggle.addEventListener('mouseenter', () => {
      if (this.animationsEnabled) {
        themeToggle.style.transform = 'scale(1.1) rotate(180deg)';
      }
    });

    themeToggle.addEventListener('mouseleave', () => {
      if (this.animationsEnabled) {
        themeToggle.style.transform = 'scale(1) rotate(0deg)';
      }
    });
  }

  /**
   * Set theme with smooth transitions
   */
  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
    }

    // Add theme change animation
    if (this.animationsEnabled) {
      document.body.style.transition = 'background-color 0.5s ease-in-out, color 0.5s ease-in-out';
    }
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Setup intersection observer for scroll animations
   */
  setupIntersectionObserver() {
    if (!this.animationsEnabled) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.card, .btn, .section').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Setup micro-interactions throughout the UI
   */
  setupMicroInteractions() {
    // Button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (this.animationsEnabled) {
          btn.style.transform = 'translateY(-2px) scale(1.02)';
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (this.animationsEnabled) {
          btn.style.transform = 'translateY(0) scale(1)';
        }
      });
    });

    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (this.animationsEnabled) {
          card.style.transform = 'translateY(-8px) scale(1.02)';
          card.style.boxShadow = 'var(--shadow-2xl)';
        }
      });

      card.addEventListener('mouseleave', () => {
        if (this.animationsEnabled) {
          card.style.transform = 'translateY(0) scale(1)';
          card.style.boxShadow = 'var(--shadow-lg)';
        }
      });
    });

    // Form input focus effects
    document.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('focus', () => {
        if (this.animationsEnabled) {
          input.style.transform = 'translateY(-2px)';
          input.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)';
        }
      });

      input.addEventListener('blur', () => {
        if (this.animationsEnabled) {
          input.style.transform = 'translateY(0)';
          input.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
        }
      });
    });
  }

  /**
   * Setup AI-driven personalization
   */
  setupAIPersonalization() {
    // Personalize content based on user behavior
    this.trackUserBehavior();
    this.adaptContent();
    this.setupSmartDefaults();
  }

  /**
   * Track user behavior for personalization
   */
  trackUserBehavior() {
    let sessionData = {
      startTime: Date.now(),
      interactions: [],
      preferences: {}
    };

    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        sessionData.interactions.push({
          type: 'click',
          element: target.dataset.track,
          timestamp: Date.now()
        });
      }
    });

    // Track form interactions
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('form-input')) {
        sessionData.interactions.push({
          type: 'input',
          field: e.target.name || e.target.id,
          timestamp: Date.now()
        });
      }
    });

    // Save session data on page unload
    window.addEventListener('beforeunload', () => {
      sessionData.duration = Date.now() - sessionData.startTime;
      this.saveSessionData(sessionData);
    });
  }

  /**
   * Adapt content based on user preferences and behavior
   */
  adaptContent() {
    // Adjust content based on user's role or preferences
    const userRole = this.detectUserRole();
    this.personalizeDashboard(userRole);

    // Adjust UI complexity based on user experience
    const userExperience = this.detectUserExperience();
    this.adjustUIComplexity(userExperience);
  }

  /**
   * Detect user role for personalization
   */
  detectUserRole() {
    // This could be enhanced with actual user data from the backend
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('role') || 'recruiter';
  }

  /**
   * Detect user experience level
   */
  detectUserExperience() {
    // Simple heuristic based on session duration and interactions
    const sessionDuration = Date.now() - (this.userPreferences.sessionStart || Date.now());
    const interactionCount = this.userPreferences.interactionCount || 0;
    
    if (sessionDuration > 300000 && interactionCount > 10) return 'expert';
    if (sessionDuration > 60000 && interactionCount > 5) return 'intermediate';
    return 'beginner';
  }

  /**
   * Personalize dashboard based on user role
   */
  personalizeDashboard(role) {
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return;

    // Add role-specific classes for styling
    dashboard.classList.add(`role-${role}`);

    // Show/hide features based on role
    const roleFeatures = {
      recruiter: ['.candidate-management', '.job-posting', '.ai-analysis'],
      manager: ['.team-overview', '.performance-metrics', '.strategic-insights'],
      admin: ['.system-settings', '.user-management', '.data-analytics']
    };

    const features = roleFeatures[role] || roleFeatures.recruiter;
    features.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = 'block';
        if (this.animationsEnabled) {
          element.classList.add('animate-fade-in');
        }
      }
    });
  }

  /**
   * Adjust UI complexity based on user experience
   */
  adjustUIComplexity(experience) {
    const body = document.body;
    
    switch (experience) {
      case 'beginner':
        body.classList.add('ui-simple');
        this.showTooltips();
        this.simplifyNavigation();
        break;
      case 'intermediate':
        body.classList.add('ui-balanced');
        this.showAdvancedFeatures();
        break;
      case 'expert':
        body.classList.add('ui-advanced');
        this.showExpertFeatures();
        this.enableKeyboardShortcuts();
        break;
    }
  }

  /**
   * Setup smart defaults based on user behavior
   */
  setupSmartDefaults() {
    // Remember form preferences
    document.querySelectorAll('form').forEach(form => {
      const formId = form.id || form.className;
      const savedData = this.userPreferences.forms?.[formId];
      
      if (savedData) {
        Object.keys(savedData).forEach(fieldName => {
          const field = form.querySelector(`[name="${fieldName}"]`);
          if (field) {
            field.value = savedData[fieldName];
          }
        });
      }

      // Save form data on input
      form.addEventListener('input', (e) => {
        if (!this.userPreferences.forms) this.userPreferences.forms = {};
        if (!this.userPreferences.forms[formId]) this.userPreferences.forms[formId] = {};
        
        this.userPreferences.forms[formId][e.target.name] = e.target.value;
        this.saveUserPreferences(this.userPreferences);
      });
    });
  }

  /**
   * Setup motion design and advanced animations
   */
  setupMotionDesign() {
    if (!this.animationsEnabled) return;

    // Parallax scrolling effect
    this.setupParallax();

    // Stagger animations for lists
    this.setupStaggerAnimations();

    // Morphing shapes and elements
    this.setupMorphingElements();
  }

  /**
   * Setup parallax scrolling effect
   */
  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.parallax || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  /**
   * Setup stagger animations for lists
   */
  setupStaggerAnimations() {
    const lists = document.querySelectorAll('.stagger-list');
    
    lists.forEach(list => {
      const items = list.querySelectorAll('.stagger-item');
      
      items.forEach((item, index) => {
        item.style.animationDelay = `${index * 100}ms`;
        item.classList.add('animate-fade-in');
      });
    });
  }

  /**
   * Setup morphing elements
   */
  setupMorphingElements() {
    const morphElements = document.querySelectorAll('[data-morph]');
    
    morphElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.borderRadius = 'var(--radius-full)';
        element.style.transform = 'scale(1.1) rotate(5deg)';
      });

      element.addEventListener('mouseleave', () => {
        element.style.borderRadius = 'var(--radius-3xl)';
        element.style.transform = 'scale(1) rotate(0deg)';
      });
    });
  }

  /**
   * Setup responsive behavior
   */
  setupResponsiveBehavior() {
    // Handle viewport changes
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleViewportChange();
      }, 250);
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleViewportChange();
      }, 100);
    });
  }

  /**
   * Handle viewport changes
   */
  handleViewportChange() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };

    // Adjust layout based on viewport
    if (viewport.width < 768) {
      document.body.classList.add('mobile-view');
      this.optimizeForMobile();
    } else {
      document.body.classList.remove('mobile-view');
      this.optimizeForDesktop();
    }

    // Adjust font sizes for better readability
    this.adjustFontSizes(viewport);
  }

  /**
   * Optimize UI for mobile devices
   */
  optimizeForMobile() {
    // Simplify navigation
    const nav = document.querySelector('nav');
    if (nav) {
      nav.classList.add('mobile-nav');
    }

    // Adjust card layouts
    document.querySelectorAll('.card').forEach(card => {
      card.classList.add('mobile-card');
    });

    // Optimize buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.classList.add('mobile-btn');
    });
  }

  /**
   * Optimize UI for desktop devices
   */
  optimizeForDesktop() {
    // Remove mobile-specific classes
    document.body.classList.remove('mobile-view');
    
    // Restore desktop layouts
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('mobile-card');
    });

    document.querySelectorAll('.btn').forEach(btn => {
      btn.classList.remove('mobile-btn');
    });
  }

  /**
   * Adjust font sizes based on viewport
   */
  adjustFontSizes(viewport) {
    const baseFontSize = Math.max(16, Math.min(20, viewport.width / 100));
    document.documentElement.style.fontSize = `${baseFontSize}px`;
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Keyboard navigation
    this.setupKeyboardNavigation();

    // Focus management
    this.setupFocusManagement();

    // Screen reader support
    this.setupScreenReaderSupport();

    // High contrast mode
    this.setupHighContrast();
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Tab navigation
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }

      // Escape key to close modals
      if (e.key === 'Escape') {
        this.closeAllModals();
      }

      // Enter key for buttons
      if (e.key === 'Enter' && e.target.classList.contains('btn')) {
        e.target.click();
      }
    });

    // Remove keyboard navigation class when mouse is used
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Trap focus in modals
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        });
      }
    });
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Add ARIA labels
    document.querySelectorAll('.btn').forEach(btn => {
      if (!btn.getAttribute('aria-label')) {
        const text = btn.textContent.trim();
        if (text) {
          btn.setAttribute('aria-label', text);
        }
      }
    });

    // Add live regions for dynamic content
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  /**
   * Setup high contrast mode
   */
  setupHighContrast() {
    const highContrastToggle = document.querySelector('.high-contrast-toggle');
    if (highContrastToggle) {
      highContrastToggle.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        this.saveUserPreferences({ highContrast: isHighContrast });
      });
    }
  }

  /**
   * Show tooltips for beginners
   */
  showTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = element.dataset.tooltip;
      element.appendChild(tooltip);

      element.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      });

      element.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      });
    });
  }

  /**
   * Show advanced features for intermediate users
   */
  showAdvancedFeatures() {
    const advancedFeatures = document.querySelectorAll('.feature-advanced');
    advancedFeatures.forEach(feature => {
      feature.style.display = 'block';
      if (this.animationsEnabled) {
        feature.classList.add('animate-fade-in');
      }
    });
  }

  /**
   * Show expert features for advanced users
   */
  showExpertFeatures() {
    const expertFeatures = document.querySelectorAll('.feature-expert');
    expertFeatures.forEach(feature => {
      feature.style.display = 'block';
      if (this.animationsEnabled) {
        feature.classList.add('animate-fade-in');
      }
    });
  }

  /**
   * Enable keyboard shortcuts for experts
   */
  enableKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }

      // Ctrl/Cmd + N for new item
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.createNewItem();
      }

      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveCurrentItem();
      }
    });
  }

  /**
   * Simplify navigation for beginners
   */
  simplifyNavigation() {
    const complexNav = document.querySelectorAll('.nav-complex');
    complexNav.forEach(nav => {
      nav.style.display = 'none';
    });
  }

  /**
   * Close all modals
   */
  closeAllModals() {
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  /**
   * Open search functionality
   */
  openSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  /**
   * Create new item
   */
  createNewItem() {
    const newItemBtn = document.querySelector('.btn-new-item');
    if (newItemBtn) {
      newItemBtn.click();
    }
  }

  /**
   * Save current item
   */
  saveCurrentItem() {
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
      saveBtn.click();
    }
  }

  /**
   * Save session data
   */
  saveSessionData(sessionData) {
    try {
      const existingData = JSON.parse(localStorage.getItem('aiRecruiterSessions') || '[]');
      existingData.push(sessionData);
      
      // Keep only last 10 sessions
      if (existingData.length > 10) {
        existingData.splice(0, existingData.length - 10);
      }
      
      localStorage.setItem('aiRecruiterSessions', JSON.stringify(existingData));
    } catch (error) {
      console.warn('Could not save session data:', error);
    }
  }

  /**
   * Get analytics data for personalization
   */
  getAnalyticsData() {
    try {
      const sessions = JSON.parse(localStorage.getItem('aiRecruiterSessions') || '[]');
      const preferences = this.userPreferences;
      
      return {
        sessions,
        preferences,
        currentSession: {
          startTime: this.userPreferences.sessionStart || Date.now(),
          interactions: this.userPreferences.interactionCount || 0
        }
      };
    } catch (error) {
      console.warn('Could not get analytics data:', error);
      return {};
    }
  }
}

// Initialize the modern UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.modernUI = new ModernUI();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernUI;
}
