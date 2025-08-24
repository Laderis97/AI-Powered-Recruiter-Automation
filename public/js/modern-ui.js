/**
 * Modern AI Recruiter UI - 2025 Design Trends
 * Features: AI-driven personalization, micro-interactions, motion design, and modern UX
 */

class ModernUI {
  constructor() {
    this.currentTheme = 'light';
    this.searchData = [];
    this.init();
  }

  init() {
    this.loadUserPreferences();
    this.setupThemeToggle();
    this.setupNavigation();
    this.setupSearch();
    this.setupEventTracking();
    this.setupBasicAnimations();
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
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
    }
    
    this.saveUserPreferences();
    console.log(`Theme switched to: ${this.currentTheme}`);
  }

  // === NAVIGATION (Lowest Complexity) ===
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
        this.updateActiveNavLink(link);
      });
    });
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  updateActiveNavLink(clickedLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    clickedLink.classList.add('active');
  }

  // === SEARCH FUNCTIONALITY (Lowest Complexity) ===
  setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
      // Search on button click
      searchBtn.addEventListener('click', () => {
        this.performSearch(searchInput.value);
      });
      
      // Search on Enter key
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch(searchInput.value);
        }
      });
      
      // Real-time search suggestions
      searchInput.addEventListener('input', (e) => {
        this.handleSearchInput(e.target.value);
      });
    }
  }

  performSearch(query) {
    if (!query.trim()) return;
    
    console.log(`Searching for: ${query}`);
    this.trackEvent('search', { query });
    
    // Simple search implementation - search through visible content
    const searchableElements = document.querySelectorAll('[data-track]');
    const results = [];
    
    searchableElements.forEach(element => {
      const text = element.textContent.toLowerCase();
      if (text.includes(query.toLowerCase())) {
        results.push({
          element: element,
          text: element.textContent,
          type: element.dataset.track
        });
      }
    });
    
    this.displaySearchResults(results, query);
  }

  handleSearchInput(query) {
    if (query.length < 2) {
      this.hideSearchSuggestions();
      return;
    }
    
    // Show search suggestions based on available data
    const suggestions = this.generateSearchSuggestions(query);
    this.showSearchSuggestions(suggestions);
  }

  generateSearchSuggestions(query) {
    // Simple suggestions based on common recruitment terms
    const commonTerms = [
      'candidates', 'jobs', 'skills', 'analysis', 'interviews',
      'hiring', 'recruitment', 'AI', 'machine learning', 'data'
    ];
    
    return commonTerms.filter(term => 
      term.toLowerCase().includes(query.toLowerCase())
    );
  }

  showSearchSuggestions(suggestions) {
    this.hideSearchSuggestions();
    
    if (suggestions.length === 0) return;
    
    const searchContainer = document.querySelector('.search-container');
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'search-suggestions';
    
    suggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.className = 'search-suggestion-item';
      item.textContent = suggestion;
      item.addEventListener('click', () => {
        document.querySelector('.search-input').value = suggestion;
        this.performSearch(suggestion);
        this.hideSearchSuggestions();
      });
      suggestionsDiv.appendChild(item);
    });
    
    searchContainer.appendChild(suggestionsDiv);
  }

  hideSearchSuggestions() {
    const existing = document.querySelector('.search-suggestions');
    if (existing) {
      existing.remove();
    }
  }

  displaySearchResults(results, query) {
    // Simple results display
    if (results.length === 0) {
      this.showNotification(`No results found for "${query}"`, 'info');
    } else {
      this.showNotification(`Found ${results.length} results for "${query}"`, 'success');
      
      // Highlight results
      results.forEach(result => {
        result.element.style.backgroundColor = 'var(--color-primary-100)';
        setTimeout(() => {
          result.element.style.backgroundColor = '';
        }, 2000);
      });
    }
  }

  // === EVENT TRACKING (Lowest Complexity) ===
  setupEventTracking() {
    document.addEventListener('click', (e) => {
      const trackableElement = e.target.closest('[data-track]');
      if (trackableElement) {
        const trackData = trackableElement.dataset.track;
        this.trackEvent('click', { 
          element: trackData,
          text: trackableElement.textContent?.trim() || '',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  trackEvent(eventType, data) {
    const eventData = {
      type: eventType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data
    };
    
    console.log('Event tracked:', eventData);
    
    // Store in localStorage for now (could be sent to analytics service later)
    this.storeEvent(eventData);
  }

  storeEvent(eventData) {
    const events = JSON.parse(localStorage.getItem('modernUI_events') || '[]');
    events.push(eventData);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('modernUI_events', JSON.stringify(events));
  }

  // === BASIC ANIMATIONS (Lowest Complexity) ===
  setupBasicAnimations() {
    // Simple fade-in animation for cards
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

    // Observe cards and sections
    document.querySelectorAll('.card, .section-header, .ai-tool-card, .candidate-card').forEach(el => {
      observer.observe(el);
    });
  }

  // === UTILITY FUNCTIONS ===
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      backgroundColor: type === 'success' ? 'var(--color-success-600)' : 
                     type === 'error' ? 'var(--color-error-600)' : 
                     'var(--color-primary-600)',
      boxShadow: 'var(--shadow-lg)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  loadUserPreferences() {
    const savedTheme = localStorage.getItem('modernUI_theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      
      // Update toggle button
      const themeToggle = document.querySelector('.theme-toggle');
      if (themeToggle) {
        themeToggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
      }
    }
  }

  saveUserPreferences() {
    localStorage.setItem('modernUI_theme', this.currentTheme);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.modernUI = new ModernUI();
});
