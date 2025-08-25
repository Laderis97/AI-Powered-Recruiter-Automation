/**
 * Modern AI Recruiter UI - 2025 Design Trends
 * Features: AI-driven personalization, micro-interactions, motion design, and modern UX
 */

class ModernUI {
  constructor() {
    this.currentTheme = 'light';
    this.searchData = [];
    this.notifications = [];
    this.init();
  }

  init() {
    this.loadUserPreferences();
    this.setupThemeToggle();
    this.setupNavigation();
    this.setupSearch();
    this.setupEventTracking();
    this.setupBasicAnimations();
    this.setupStatsCounters();
    this.setupCardInteractions();
    this.setupNotificationSystem();
    this.setupLoadingStates();
  }

  // === THEME TOGGLE (Lowest Complexity) ===
  setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Update toggle button icon
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
      icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    this.saveUserPreferences();
    this.showNotification('Theme changed to ' + this.currentTheme, 'success');
  }

  // === NAVIGATION (Lowest Complexity) ===
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // === SEARCH (Lowest Complexity) ===
  setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.performSearch(searchInput.value);
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch(searchInput.value);
        }
      });
    }
  }

  performSearch(query) {
    if (!query.trim()) {
      this.showNotification('Please enter a search term', 'warning');
      return;
    }
    
    this.showNotification(`Searching for: ${query}`, 'info');
    // TODO: Implement actual search functionality
    console.log('Search query:', query);
  }

  // === EVENT TRACKING (Lowest Complexity) ===
  setupEventTracking() {
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.trackEvent('button_click', {
          text: button.textContent.trim(),
          class: button.className,
          id: button.id || 'unknown'
        });
      });
    });
  }

  trackEvent(eventType, data) {
    console.log('Event tracked:', eventType, data);
    // TODO: Send to analytics service
  }

  // === BASIC ANIMATIONS (Lowest Complexity) ===
  setupBasicAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card, .dashboard-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // === PHASE 2: STATS COUNTERS (Medium Complexity) ===
  setupStatsCounters() {
    const statsElements = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statsElements.forEach(stat => observer.observe(stat));
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target') || element.textContent.replace(/\D/g, ''));
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  }

  // === PHASE 2: CARD INTERACTIONS (Medium Complexity) ===
  setupCardInteractions() {
    const cards = document.querySelectorAll('.card, .dashboard-card');
    
    cards.forEach(card => {
      // Enhanced hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = 'var(--shadow-xl)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = 'var(--shadow-md)';
      });

      // Click effects
      card.addEventListener('click', () => {
        this.rippleEffect(card, event);
      });
    });
  }

  rippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // === PHASE 2: NOTIFICATION SYSTEM (Medium Complexity) ===
  setupNotificationSystem() {
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(notificationContainer);
  }

  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-${type});
      border-radius: var(--radius-md);
      padding: var(--space-4);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
    `;
    
    const container = document.querySelector('.notification-container');
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hideNotification(notification);
    });
    
    // Auto-hide
    setTimeout(() => {
      this.hideNotification(notification);
    }, duration);
  }

  hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  // === PHASE 2: LOADING STATES (Medium Complexity) ===
  setupLoadingStates() {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('button[data-loading]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.showLoadingState(button);
      });
    });
  }

  showLoadingState(button) {
    const originalText = button.textContent;
    const originalHTML = button.innerHTML;
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    // Simulate loading (replace with actual async operation)
    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalHTML;
      this.showNotification('Operation completed!', 'success');
    }, 2000);
  }

  // === UTILITY METHODS ===
  loadUserPreferences() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  saveUserPreferences() {
    localStorage.setItem('theme', this.currentTheme);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.modernUI = new ModernUI();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--color-text-secondary);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .notification-close:hover {
    background: var(--color-background-hover);
  }
`;
document.head.appendChild(style);
