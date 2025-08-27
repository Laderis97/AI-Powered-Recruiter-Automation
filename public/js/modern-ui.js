/**
 * Modern AI Recruiter UI - 2025 Design Trends
 * Features: AI-driven personalization, micro-interactions, motion design, and modern UX
 */

class ModernUI {
  constructor() {
    this.currentTheme = 'light';
    this.searchData = [];
    this.notifications = [];
    this.userBehavior = {};
    this.personalizationData = {};
    this.animationQueue = [];
    this.dataUpdateInterval = null;
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
    this.setupAIPersonalization();
    this.setupAdvancedAnimations();
    this.setupRealTimeUpdates();
    this.setupAdvancedSearch();
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
  async setupStatsCounters() {
    // Fetch real analytics data first
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const analytics = await response.json();
        this.updateStatsWithRealData(analytics);
      } else {
        console.warn('Failed to fetch analytics, using fallback data');
        this.updateStatsWithFallbackData();
      }
    } catch (error) {
      console.warn('Error fetching analytics, using fallback data:', error);
      this.updateStatsWithFallbackData();
    }

    // Setup intersection observer for animation
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

  updateStatsWithRealData(analytics) {
    const statElements = document.querySelectorAll('.stat-number[data-analytics]');
    
    statElements.forEach(element => {
      const analyticsKey = element.getAttribute('data-analytics');
      let value = 0;
      
      switch (analyticsKey) {
        case 'totalCandidates':
          value = analytics.totalCandidates || 0;
          break;
        case 'totalJobs':
          value = analytics.totalJobs || 0;
          break;
        case 'totalCampaigns':
          value = analytics.totalCampaigns || 0;
          break;
        case 'responseRate':
          // Convert percentage string to number (e.g., "85.5%" -> 85.5)
          const rateStr = analytics.responseRate || '0%';
          value = parseFloat(rateStr.replace('%', '')) || 0;
          break;
      }
      
      element.setAttribute('data-target', value.toString());
    });
  }

  updateStatsWithFallbackData() {
    // Fallback to the original numbers you provided
    const fallbackData = {
      totalCandidates: 156,
      totalJobs: 23,
      totalCampaigns: 89,
      responseRate: 12
    };
    
    this.updateStatsWithRealData(fallbackData);
  }

  animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target') || element.textContent.replace(/\D/g, ''));
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
      
      // Check if this is the response rate (should show as percentage)
      const analyticsKey = element.getAttribute('data-analytics');
      if (analyticsKey === 'responseRate') {
        element.textContent = current.toFixed(1) + '%';
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
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

  // === PHASE 3: AI-DRIVEN PERSONALIZATION (Higher Complexity) ===
  setupAIPersonalization() {
    this.trackUserBehavior();
    this.adaptContent();
    this.setupSmartDefaults();
  }

  trackUserBehavior() {
    // Track user interactions
    document.addEventListener('click', (e) => {
      const element = e.target.closest('[data-track]');
      if (element) {
        const trackData = element.dataset.track;
        this.userBehavior[trackData] = (this.userBehavior[trackData] || 0) + 1;
      }
    });

    // Track scroll behavior
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.userBehavior.scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      }, 100);
    });

    // Track time spent
    setInterval(() => {
      this.userBehavior.timeSpent = (this.userBehavior.timeSpent || 0) + 1;
    }, 1000);
  }

  adaptContent() {
    // Adapt content based on user behavior
    if (this.userBehavior.timeSpent > 60) {
      this.showAdvancedFeatures();
    }
    
    if (this.userBehavior.scrollDepth > 80) {
      this.showExpertFeatures();
    }
  }

  showAdvancedFeatures() {
    const advancedElements = document.querySelectorAll('[data-advanced]');
    advancedElements.forEach(el => {
      el.style.display = 'block';
      el.classList.add('fade-in');
    });
  }

  showExpertFeatures() {
    const expertElements = document.querySelectorAll('[data-expert]');
    expertElements.forEach(el => {
      el.style.display = 'block';
      el.classList.add('fade-in');
    });
  }

  setupSmartDefaults() {
    // Set smart defaults based on user preferences
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      this.applyUserPreferences(preferences);
    }
  }

  applyUserPreferences(preferences) {
    // Apply saved preferences
    if (preferences.theme) {
      this.setTheme(preferences.theme);
    }
    if (preferences.layout) {
      this.setLayout(preferences.layout);
    }
  }

  // === PHASE 3: ADVANCED ANIMATIONS (Higher Complexity) ===
  setupAdvancedAnimations() {
    this.setupParallax();
    this.setupStaggerAnimations();
    this.setupMorphingElements();
    this.setupIntersectionObserver();
  }

  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  setupStaggerAnimations() {
    const staggerElements = document.querySelectorAll('[data-stagger]');
    
    staggerElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.6s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }

  setupMorphingElements() {
    const morphElements = document.querySelectorAll('[data-morph]');
    
    morphElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'scale(1.05) rotate(2deg)';
        element.style.filter = 'brightness(1.1)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1) rotate(0deg)';
        element.style.filter = 'brightness(1)';
      });
    });
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.card, .section-header, .ai-tool-card, .candidate-card').forEach(el => {
      observer.observe(el);
    });
  }

  // === PHASE 3: REAL-TIME DATA UPDATES (Higher Complexity) ===
  setupRealTimeUpdates() {
    this.startDataUpdates();
    this.setupWebSocket();
  }

  startDataUpdates() {
    // Update stats every 30 seconds
    this.dataUpdateInterval = setInterval(() => {
      this.updateDashboardData();
    }, 30000);
  }

  updateDashboardData() {
    // Simulate real-time data updates
    this.updateStats();
    this.updateActivityFeed();
    this.updateNotifications();
  }

  updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const currentValue = parseInt(stat.textContent.replace(/\D/g, ''));
      const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newValue = Math.max(0, currentValue + variation);
      
      if (newValue !== currentValue) {
        stat.textContent = newValue;
        stat.classList.add('updated');
        setTimeout(() => stat.classList.remove('updated'), 1000);
      }
    });
  }

  updateActivityFeed() {
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
      const newActivity = document.createElement('li');
      newActivity.className = 'activity-item new-activity';
      newActivity.innerHTML = `
        <div class="activity-icon">🆕</div>
        <div class="activity-content">
          <div class="activity-text">Real-time update: New data available</div>
          <div class="activity-time">Just now</div>
        </div>
      `;
      
      activityList.insertBefore(newActivity, activityList.firstChild);
      
      // Remove old activities if too many
      if (activityList.children.length > 5) {
        activityList.removeChild(activityList.lastChild);
      }
      
      // Animate new activity
      setTimeout(() => newActivity.classList.remove('new-activity'), 2000);
    }
  }

  updateNotifications() {
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
      const currentCount = parseInt(notificationBadge.textContent);
      const newCount = currentCount + Math.floor(Math.random() * 2);
      notificationBadge.textContent = newCount;
      
      if (newCount > currentCount) {
        notificationBadge.classList.add('pulse');
        setTimeout(() => notificationBadge.classList.remove('pulse'), 1000);
      }
    }
  }

  setupWebSocket() {
    // Simulate WebSocket connection for real-time updates
    // In a real implementation, this would connect to your backend
    console.log('WebSocket connection simulated for real-time updates');
  }

  // === PHASE 3: ADVANCED SEARCH & FILTERING (Higher Complexity) ===
  setupAdvancedSearch() {
    this.setupSearchSuggestions();
    this.setupFilters();
    this.setupSorting();
  }

  setupSearchSuggestions() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length >= 2) {
          this.showSearchSuggestions(query);
        } else {
          this.hideSearchSuggestions();
        }
      });
    }
  }

  showSearchSuggestions(query) {
    this.hideSearchSuggestions();
    
    const suggestions = this.generateSearchSuggestions(query);
    if (suggestions.length === 0) return;
    
    const searchContainer = document.querySelector('.search-container');
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'search-suggestions';
    
    suggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.className = 'search-suggestion-item';
      item.innerHTML = `
        <i class="fas fa-${suggestion.icon}"></i>
        <span>${suggestion.text}</span>
        <span class="suggestion-type">${suggestion.type}</span>
      `;
      
      item.addEventListener('click', () => {
        document.querySelector('.search-input').value = suggestion.text;
        this.performSearch(suggestion.text);
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

  generateSearchSuggestions(query) {
    const suggestions = [
      { text: 'Frontend Developer', type: 'Job Title', icon: 'code' },
      { text: 'Python Engineer', type: 'Skill', icon: 'python' },
      { text: 'Product Manager', type: 'Role', icon: 'user-tie' },
      { text: 'Machine Learning', type: 'Skill', icon: 'brain' },
      { text: 'React Developer', type: 'Skill', icon: 'react' }
    ];
    
    return suggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );
  }

  setupFilters() {
    // Add filter buttons to dashboard
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="candidates">Candidates</button>
        <button class="filter-btn" data-filter="jobs">Jobs</button>
        <button class="filter-btn" data-filter="analytics">Analytics</button>
      </div>
    `;
    
    const dashboardSection = document.querySelector('#dashboard');
    if (dashboardSection) {
      dashboardSection.insertBefore(filterContainer, dashboardSection.firstChild);
    }
    
    // Add filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyFilter(btn.dataset.filter);
        
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  applyFilter(filter) {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
      if (filter === 'all' || section.id === filter) {
        section.style.display = 'block';
        section.classList.add('fade-in');
      } else {
        section.style.display = 'none';
      }
    });
  }

  setupSorting() {
    // Add sorting functionality to candidate cards
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-container';
    sortContainer.innerHTML = `
      <select class="sort-select">
        <option value="name">Sort by Name</option>
        <option value="skills">Sort by Skills</option>
        <option value="match">Sort by Match %</option>
      </select>
    `;
    
    const candidatesSection = document.querySelector('#candidates');
    if (candidatesSection) {
      const sectionHeader = candidatesSection.querySelector('.section-header');
      sectionHeader.appendChild(sortContainer);
    }
    
    // Add sort functionality
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortCandidates(e.target.value);
      });
    }
  }

  sortCandidates(sortBy) {
    const candidatesGrid = document.querySelector('.candidates-grid');
    const candidates = Array.from(candidatesGrid.children);
    
    candidates.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.querySelector('.candidate-name').textContent;
          bValue = b.querySelector('.candidate-name').textContent;
          return aValue.localeCompare(bValue);
        case 'skills':
          aValue = a.querySelectorAll('.skill-tag').length;
          bValue = b.querySelectorAll('.skill-tag').length;
          return bValue - aValue;
        case 'match':
          aValue = Math.random() * 100; // Simulate match percentage
          bValue = Math.random() * 100;
          return bValue - aValue;
        default:
          return 0;
      }
    });
    
    // Reorder candidates
    candidates.forEach(candidate => {
      candidatesGrid.appendChild(candidate);
    });
    
    // Animate reordering
    candidates.forEach((candidate, index) => {
      setTimeout(() => {
        candidate.classList.add('reorder-animation');
        setTimeout(() => candidate.classList.remove('reorder-animation'), 500);
      }, index * 100);
    });
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

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.saveUserPreferences();
  }

  setLayout(layout) {
    document.body.setAttribute('data-layout', layout);
  }

  // Cleanup method
  destroy() {
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }
  }
}

// ===== GLOBAL VARIABLES =====

// Global variables for resume upload
let selectedFiles = [];
let uploadQueue = [];
let parsedResults = [];

// Global variables for job management
let jobsData = [];

// Global variables for candidate management
let candidatesData = [];

// ===== RESUME UPLOAD FUNCTIONALITY =====

// Function to open the resume upload modal
function openResumeUploadModal() {
  const modal = document.getElementById('resumeUploadModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

// Function to close the resume upload modal
function closeResumeUploadModal() {
  const modal = document.getElementById('resumeUploadModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Reset the form
    resetUploadForm();
  }
}

// Function to reset the upload form
function resetUploadForm() {
  selectedFiles = [];
  uploadQueue = [];
  parsedResults = [];
  const fileList = document.getElementById('fileList');
  const progressBar = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const resultsContent = document.getElementById('resultsContent');
  
  if (fileList) fileList.innerHTML = '';
  if (progressBar) progressBar.style.width = '0%';
  if (progressText) progressText.textContent = 'Ready to upload';
  if (resultsContent) resultsContent.innerHTML = '';
}

// Initialize resume upload functionality
function initializeResumeUpload() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('resumeFileInput');
  
  if (uploadZone) {
    // Drag and drop functionality
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    uploadZone.addEventListener('click', () => fileInput.click());
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Add event listener for the "Upload Resume" button
  const uploadResumeBtn = document.querySelector('[data-track="quick-upload-resume"]');
  if (uploadResumeBtn) {
    uploadResumeBtn.addEventListener('click', openResumeUploadModal);
  }
}

// Drag and drop handlers
function handleDragOver(e) {
  e.preventDefault();
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.classList.add('dragover');
  }
}

function handleDragLeave(e) {
  e.preventDefault();
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.classList.remove('dragover');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.classList.remove('dragover');
  }
  
  const files = Array.from(e.dataTransfer.files);
  addFilesToQueue(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFilesToQueue(files);
}

function addFilesToQueue(files) {
  const validFiles = files.filter(file => {
    const validTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return validTypes.includes(fileExtension);
  });
  
  if (validFiles.length === 0) {
    showNotification('No valid files selected. Supported formats: PDF, DOCX, DOC, TXT', 'error');
    return;
  }
  
  selectedFiles = [...selectedFiles, ...validFiles];
  updateFileList();
  showProcessButton();
  
  if (validFiles.length !== files.length) {
    showNotification(`${files.length - validFiles.length} files were skipped (unsupported format)`, 'warning');
  }
}

function updateFileList() {
  const resultsContent = document.getElementById('resultsContent');
  if (!resultsContent) return;
  
  resultsContent.innerHTML = `
    <div class="file-list">
      ${selectedFiles.map((file, index) => `
        <div class="file-item" data-file-index="${index}">
          <div class="file-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
          </div>
          <div class="file-status pending">Pending</div>
        </div>
      `).join('')}
    </div>
  `;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload processing
function processUploads() {
  if (selectedFiles.length === 0) {
    showNotification('No files selected for upload', 'error');
    return;
  }
  
  hideProcessButton();
  showProgress();
  updateProgress(0, 'Preparing files...');
  
  // Process files sequentially to avoid overwhelming the server
  processFilesSequentially(selectedFiles, 0);
}

async function processFilesSequentially(files, index) {
  if (index >= files.length) {
    // All files processed
    updateProgress(100, 'Upload complete!');
    setTimeout(() => {
      hideProgress();
      displayParsedResults();
      showResults();
      showNotification(`${files.length} resume(s) processed successfully!`, 'success');
      // Refresh candidates list to show newly uploaded candidates
      loadCandidates();
    }, 1000);
    return;
  }
  
  const file = files[index];
  const progress = Math.round((index / files.length) * 100);
  updateProgress(progress, `Processing ${file.name}...`);
  
  try {
    const result = await uploadSingleFile(file, index);
    updateFileStatus(index, 'success', 'Processed successfully');
    parsedResults.push(result);
  } catch (error) {
    console.error('Error processing file:', error);
    updateFileStatus(index, 'error', error.message || 'Processing failed');
  }
  
  // Process next file
  setTimeout(() => {
    processFilesSequentially(files, index + 1);
  }, 500);
}

async function uploadSingleFile(file, index) {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await fetch('/api/upload-resume', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }
  
  const result = await response.json();
  return result;
}

// UI update functions
function updateProgress(percentage, text) {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  
  if (progressText) {
    progressText.textContent = text;
  }
}

function updateFileStatus(index, status, message) {
  const fileItem = document.querySelector(`[data-file-index="${index}"]`);
  if (fileItem) {
    const statusElement = fileItem.querySelector('.file-status');
    if (statusElement) {
      statusElement.className = `file-status ${status}`;
      statusElement.textContent = message;
    }
  }
}

function showProgress() {
  const progress = document.getElementById('uploadProgress');
  if (progress) {
    progress.style.display = 'block';
  }
}

function hideProgress() {
  const progress = document.getElementById('uploadProgress');
  if (progress) {
    progress.style.display = 'none';
  }
}

function showResults() {
  const results = document.getElementById('uploadResults');
  if (results) {
    results.style.display = 'block';
  }
}

function hideResults() {
  const results = document.getElementById('uploadResults');
  if (results) {
    results.style.display = 'none';
  }
}

function showProcessButton() {
  const processBtn = document.getElementById('processBtn');
  if (processBtn) {
    processBtn.style.display = 'block';
  }
}

function hideProcessButton() {
  const processBtn = document.getElementById('processBtn');
  if (processBtn) {
    processBtn.style.display = 'none';
  }
}

function updateUploadZone() {
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.classList.remove('dragover');
  }
}

function clearResults() {
  const resultsContent = document.getElementById('resultsContent');
  if (resultsContent) {
    resultsContent.innerHTML = '';
  }
  hideResults();
}

function displayParsedResults() {
  const resultsContent = document.getElementById('resultsContent');
  if (!resultsContent || parsedResults.length === 0) return;
  
  let resultsHTML = '<h4>Parsed Candidates</h4>';
  
  parsedResults.forEach((candidate, index) => {
    const skillsList = candidate.skills && candidate.skills.length > 0 
      ? candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join(' ')
      : '<em>No skills detected</em>';
    
    const educationList = candidate.education && candidate.education.length > 0
      ? candidate.education.map(edu => `<span class="skill-tag">${edu}</span>`).join(' ')
      : '<em>No education detected</em>';
    
    resultsHTML += `
      <div class="result-item success">
        <div class="result-icon">✓</div>
        <div class="result-content">
          <div class="result-title">${candidate.name || 'Unknown Name'}</div>
          <div class="result-message">
            <strong>Title:</strong> ${candidate.title || 'Not specified'}<br>
            <strong>Company:</strong> ${candidate.currentCompany || 'Not specified'}<br>
            <strong>Location:</strong> ${candidate.location || 'Not specified'}<br>
            <strong>Experience:</strong> ${candidate.experience || 'Not specified'}<br>
            <strong>Email:</strong> ${candidate.email || 'Not found'}<br>
            <strong>Phone:</strong> ${candidate.phone || 'Not found'}<br>
            <strong>Skills:</strong> ${skillsList}<br>
            <strong>Education:</strong> ${educationList}<br>
            ${candidate.linkedin ? `<strong>LinkedIn:</strong> <a href="${candidate.linkedin}" target="_blank">${candidate.linkedin}</a><br>` : ''}
            ${candidate.github ? `<strong>GitHub:</strong> <a href="${candidate.github}" target="_blank">${candidate.github}</a><br>` : ''}
            ${candidate.portfolio ? `<strong>Portfolio:</strong> <a href="${candidate.portfolio}" target="_blank">${candidate.portfolio}</a><br>` : ''}
            ${candidate.summary ? `<strong>Summary:</strong> ${candidate.summary}<br>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  resultsContent.innerHTML = resultsHTML;
}

function openBulkUpload() {
  const fileInput = document.getElementById('resumeFileInput');
  if (fileInput) {
    fileInput.multiple = true;
    fileInput.click();
  }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return 'check-circle';
    case 'error': return 'exclamation-circle';
    case 'warning': return 'exclamation-triangle';
    default: return 'info-circle';
  }
}

// Initialize resume upload when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded: Starting initialization...');
  
  // Initialize ModernUI
  const modernUI = new ModernUI();
  
  // Initialize resume upload functionality
  initializeResumeUpload();
  
  // Initialize job management functionality
  initializeJobManagement();
  
  // Initialize candidate management functionality
  initializeCandidateManagement();
  
  // Initialize AI tools
  initializeAITools();
  
  // Initialize analytics
  initializeAnalytics();
  
  // Test candidate data after a short delay
  setTimeout(() => {
    console.log('DOMContentLoaded: Testing candidate data after delay...');
    console.log('candidatesData at test time:', candidatesData);
    console.log('candidatesData length at test time:', candidatesData.length);
    
    // Force a re-render to see if that helps
    if (candidatesData.length > 0) {
      console.log('DOMContentLoaded: Forcing re-render of candidates...');
      renderCandidates();
    }
  }, 2000);
  
  // Close modal when clicking outside
  const modal = document.getElementById('resumeUploadModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeResumeUploadModal();
      }
    });
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeResumeUploadModal();
    }
  });
});

// Global functions for onclick handlers
window.openResumeUploadModal = openResumeUploadModal;
window.closeResumeUploadModal = closeResumeUploadModal;
window.processUploads = processUploads;
window.clearResults = clearResults;
window.openBulkUpload = openBulkUpload;

// Job management global functions
window.openAddJobModal = openAddJobModal;
window.closeAddJobModal = closeAddJobModal;
window.saveAsDraft = saveAsDraft;
window.publishJob = publishJob;
window.editJob = editJob;
window.viewApplications = viewApplications;
window.showJobOptions = showJobOptions;

// Candidate management global functions
window.viewCandidateDetails = viewCandidateDetails;
window.contactCandidate = contactCandidate;
window.archiveCandidate = archiveCandidate;

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
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
  
  .fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  .new-activity {
    background: var(--color-primary-50);
    border-left: 4px solid var(--color-primary-500);
  }
  
  .updated {
    animation: pulse 0.5s ease-in-out;
  }
  
  .pulse {
    animation: pulse 1s ease-in-out;
  }
  
  .reorder-animation {
    animation: fadeIn 0.5s ease-out;
  }
  
  .filter-container {
    margin-bottom: var(--space-6);
    text-align: center;
  }
  
  .filter-buttons {
    display: flex;
    gap: var(--space-2);
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .filter-btn {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-background);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .filter-btn:hover,
  .filter-btn.active {
    background: var(--color-primary-500);
    color: white;
    border-color: var(--color-primary-500);
  }
  
  .sort-container {
    margin-top: var(--space-4);
  }
  
  .sort-select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }
  
  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 1000;
    margin-top: var(--space-2);
    max-height: 300px;
    overflow-y: auto;
  }
  
  .search-suggestion-item {
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
    transition: background-color 0.2s;
  }
  
  .search-suggestion-item:last-child {
    border-bottom: none;
  }
  
  .search-suggestion-item:hover {
    background: var(--color-primary-50);
  }
  
  .suggestion-type {
    margin-left: auto;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    background: var(--color-background-subtle);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
  }
`;
document.head.appendChild(style);

// ===== JOB MANAGEMENT FUNCTIONALITY =====

// Global variables for job management
let currentJobId = null;

// Function to open the Add Job modal
function openAddJobModal() {
  const modal = document.getElementById('addJobModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Reset form
    resetJobForm();
  }
}

// Function to close the Add Job modal
function closeAddJobModal() {
  const modal = document.getElementById('addJobModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Reset form
    resetJobForm();
  }
}

// Function to reset the job form
function resetJobForm() {
  const form = document.getElementById('addJobForm');
  if (form) {
    form.reset();
    currentJobId = null;
  }
}

// Function to save job as draft
function saveAsDraft() {
  const formData = getJobFormData();
  if (formData) {
    formData.status = 'draft';
    submitJob(formData, 'Job saved as draft successfully!');
  }
}

// Function to publish job
function publishJob() {
  const formData = getJobFormData();
  if (formData) {
    formData.status = 'active';
    submitJob(formData, 'Job published successfully!');
  }
}

// Function to get job form data
function getJobFormData() {
  const form = document.getElementById('addJobForm');
  if (!form) return null;

  const formData = new FormData(form);
  const jobData = {
    title: formData.get('title') || '',
    department: formData.get('department') || '',
    location: formData.get('location') || '',
    employmentType: formData.get('employmentType') || '',
    salary: formData.get('salary') || '',
    experienceLevel: formData.get('experienceLevel') || '',
    description: formData.get('description') || '',
    responsibilities: formData.get('responsibilities') || '',
    requirements: formData.get('requirements') || '',
    skills: formData.get('skills') || '',
    niceToHave: formData.get('niceToHave') || '',
    benefits: formData.get('benefits') || '',
    perks: formData.get('perks') || '',
    startDate: formData.get('startDate') || '',
    status: formData.get('status') || 'draft'
  };

  // Validate required fields
  if (!jobData.title || !jobData.location || !jobData.employmentType || !jobData.description) {
    showNotification('Please fill in all required fields.', 'error');
    return null;
  }

  return jobData;
}

// Function to submit job data
async function submitJob(jobData, successMessage) {
  try {
    showNotification('Saving job...', 'info');
    
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      const result = await response.json();
      showNotification(successMessage, 'success');
      closeAddJobModal();
      loadJobs(); // Refresh jobs list
    } else {
      const error = await response.json();
      showNotification(error.message || 'Failed to save job', 'error');
    }
  } catch (error) {
    console.error('Error submitting job:', error);
    showNotification('Failed to save job. Please try again.', 'error');
  }
}

// Function to load jobs from the server
async function loadJobs() {
  try {
    const response = await fetch('/api/jobs');
    if (response.ok) {
      const data = await response.json();
      jobsData = data.jobs || [];
      renderJobs();
    } else {
      console.error('Failed to load jobs');
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
  }
}

// Function to render jobs in the grid
function renderJobs() {
  const jobsGrid = document.getElementById('jobsGrid');
  if (!jobsGrid) return;

  // Clear existing content
  jobsGrid.innerHTML = '';

  if (jobsData.length === 0) {
    jobsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: var(--space-8);">
        <div style="font-size: 3rem; margin-bottom: var(--space-4);">📋</div>
        <h3 style="margin-bottom: var(--space-2); color: var(--color-text-primary);">No Jobs Yet</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: var(--space-4);">
          Create your first job posting to get started with recruitment.
        </p>
        <button class="btn btn-primary" onclick="openAddJobModal()">
          <i class="fas fa-plus"></i>
          Create First Job
        </button>
      </div>
    `;
    return;
  }

  jobsData.forEach(job => {
    const jobCard = createJobCard(job);
    jobsGrid.appendChild(jobCard);
  });
}

// Function to create a job card element
function createJobCard(job) {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.setAttribute('data-stagger', '');
  card.setAttribute('data-track', 'job-card');
  card.setAttribute('data-job-id', job.id);

  // Handle skills as array (new format) or string (old format)
  const skillsArray = Array.isArray(job.skills) ? job.skills : (job.skills ? job.skills.split(',') : []);
  const skills = skillsArray.slice(0, 3);
  const skillsDisplay = skills.map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('');
  const moreSkills = skillsArray.length - 3;

  card.innerHTML = `
    <div class="job-header">
      <div class="job-title-section">
        <h3 class="job-title">${job.title}</h3>
        <span class="job-status ${job.status}">${job.status}</span>
      </div>
      <div class="job-actions">
        <button class="btn-icon" title="Edit Job" data-track="edit-job" onclick="editJob('${job.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" title="View Applications" data-track="view-applications" onclick="viewApplications('${job.id}')">
          <i class="fas fa-users"></i>
        </button>
        <button class="btn-icon" title="More Options" data-track="job-more" onclick="showJobOptions('${job.id}')">
          <i class="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </div>
    
    <div class="job-details">
      <div class="job-meta">
        <span class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
        <span class="job-type"><i class="fas fa-clock"></i> ${job.employmentType}</span>
        ${job.salary ? `<span class="job-salary"><i class="fas fa-dollar-sign"></i> ${job.salary}</span>` : ''}
      </div>
      
      <p class="job-description">
        ${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}
      </p>
      
      <div class="job-skills">
        ${skillsDisplay}
        ${moreSkills > 0 ? `<span class="skill-tag">+${moreSkills} more</span>` : ''}
      </div>
    </div>
    
    <div class="job-stats">
      <div class="stat-item">
        <span class="stat-number">${job.applications || 0}</span>
        <span class="stat-label">Applications</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${job.interviews || 0}</span>
        <span class="stat-label">Interviews</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">${job.finalists || 0}</span>
        <span class="stat-label">Finalists</span>
      </div>
    </div>
  `;

  return card;
}

// Function to edit a job
function editJob(jobId) {
  const job = jobsData.find(j => j.id === jobId);
  if (!job) return;

  currentJobId = jobId;
  populateJobForm(job);
  openAddJobModal();
}

// Function to populate job form with existing data
function populateJobForm(job) {
  const form = document.getElementById('addJobForm');
  if (!form) return;

  // Populate form fields
  form.querySelector('[name="title"]').value = job.title || '';
  form.querySelector('[name="department"]').value = job.company || '';
  form.querySelector('[name="location"]').value = job.location || '';
  form.querySelector('[name="employmentType"]').value = job.type || '';
  form.querySelector('[name="salary"]').value = job.salary || '';
  form.querySelector('[name="experienceLevel"]').value = job.experienceLevel || '';
  form.querySelector('[name="description"]').value = job.description || '';
  form.querySelector('[name="responsibilities"]').value = job.responsibilities || '';
  
  // Handle requirements and skills as arrays
  const requirements = Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements || '';
  const skills = Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '';
  
  form.querySelector('[name="requirements"]').value = requirements;
  form.querySelector('[name="skills"]').value = skills;
  form.querySelector('[name="niceToHave"]').value = job.niceToHave || '';
  form.querySelector('[name="benefits"]').value = job.benefits || '';
  form.querySelector('[name="perks"]').value = job.perks || '';
  form.querySelector('[name="startDate"]').value = job.startDate || '';
  form.querySelector('[name="status"]').value = job.status || 'draft';
}

// Function to view applications for a job
function viewApplications(jobId) {
  showNotification('Applications feature coming soon!', 'info');
  // TODO: Implement applications view
}

// Function to show job options menu
function showJobOptions(jobId) {
  showNotification('Job options menu coming soon!', 'info');
  // TODO: Implement job options menu
}

// Function to filter jobs
function filterJobs() {
  const statusFilter = document.querySelector('[data-track="job-status-filter"]').value;
  const typeFilter = document.querySelector('[data-track="job-type-filter"]').value;
  
  const filteredJobs = jobsData.filter(job => {
    const statusMatch = statusFilter === 'all' || job.status === statusFilter;
    const typeMatch = typeFilter === 'all' || job.employmentType === typeFilter;
    return statusMatch && typeMatch;
  });

  renderFilteredJobs(filteredJobs);
}

// Function to render filtered jobs
function renderFilteredJobs(filteredJobs) {
  const jobsGrid = document.getElementById('jobsGrid');
  if (!jobsGrid) return;

  jobsGrid.innerHTML = '';
  filteredJobs.forEach(job => {
    const jobCard = createJobCard(job);
    jobsGrid.appendChild(jobCard);
  });
}

// Initialize job management functionality
function initializeJobManagement() {
  // Add event listeners for job filters
  const statusFilter = document.querySelector('[data-track="job-status-filter"]');
  const typeFilter = document.querySelector('[data-track="job-type-filter"]');
  
  if (statusFilter) {
    statusFilter.addEventListener('change', filterJobs);
  }
  
  if (typeFilter) {
    typeFilter.addEventListener('change', filterJobs);
  }

  // Load initial jobs
  loadJobs();
}

// ===== CANDIDATE MANAGEMENT FUNCTIONALITY =====

// Function to load candidates from the server
async function loadCandidates() {
  try {
    console.log('loadCandidates: Starting to fetch candidates...');
    showCandidatesLoading();
    
    const response = await fetch('/api/candidates');
    console.log('loadCandidates: Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('loadCandidates: Raw data received:', data);
      console.log('loadCandidates: Data type:', typeof data);
      console.log('loadCandidates: Data length:', Array.isArray(data) ? data.length : 'Not an array');
      
      candidatesData = data || [];
      console.log('loadCandidates: Processed candidatesData:', candidatesData);
      console.log('loadCandidates: candidatesData length:', candidatesData.length);
      
      renderCandidates();
    } else {
      console.error('loadCandidates: Failed to load candidates, status:', response.status);
      showCandidatesEmpty();
    }
  } catch (error) {
    console.error('loadCandidates: Error loading candidates:', error);
    showCandidatesEmpty();
  }
}

// Function to render candidates in the grid
function renderCandidates() {
  console.log('renderCandidates called with data:', candidatesData);
  
  const candidatesGrid = document.getElementById('candidatesGrid');
  const loadingState = document.getElementById('candidatesLoading');
  const emptyState = document.getElementById('candidatesEmpty');
  
  console.log('DOM elements found:', {
    candidatesGrid: !!candidatesGrid,
    loadingState: !!loadingState,
    emptyState: !!emptyState
  });
  
  if (!candidatesGrid) {
    console.error('candidatesGrid element not found!');
    return;
  }
  
     // Hide loading and empty states
   if (loadingState) {
     loadingState.style.display = 'none';
     console.log('Hidden loading state');
   }
   if (emptyState) {
     emptyState.style.display = 'none';
     console.log('Hidden empty state');
   }
  
     // Clear existing content
   candidatesGrid.innerHTML = '';
   console.log('Cleared candidates grid');
   
   // Ensure candidates grid is visible
   candidatesGrid.style.display = 'grid';
   console.log('Set candidates grid display to grid');
  
  console.log('candidatesData length:', candidatesData.length);
  
  if (candidatesData.length === 0) {
    console.log('No candidates data, showing empty state');
    showCandidatesEmpty();
    return;
  }
  
  console.log('Creating candidate cards for', candidatesData.length, 'candidates');
  candidatesData.forEach((candidate, index) => {
    console.log(`Creating card ${index + 1}:`, candidate);
    const candidateCard = createCandidateCard(candidate);
         if (candidateCard) {
       candidatesGrid.appendChild(candidateCard);
       console.log(`Card ${index + 1} added to grid`);
       console.log(`Grid now has ${candidatesGrid.children.length} children`);
       console.log(`Grid display style: ${candidatesGrid.style.display}`);
       console.log(`Grid computed display: ${window.getComputedStyle(candidatesGrid).display}`);
     } else {
       console.error(`Failed to create card for candidate ${index + 1}:`, candidate);
     }
  });
}

// Function to create a candidate card element
function createCandidateCard(candidate) {
  try {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.setAttribute('data-stagger', '');
    card.setAttribute('data-track', 'candidate-card');
    card.setAttribute('data-candidate-id', candidate.id || 'unknown');
    
    // Generate initials for avatar
    const initials = candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    
    // Display skills (limit to 3) - handle both array and string formats
    let skills = '<em>No skills detected</em>';
    if (candidate.skills) {
      if (Array.isArray(candidate.skills)) {
        skills = candidate.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('');
      } else if (typeof candidate.skills === 'string') {
        // Handle case where skills might be a comma-separated string
        const skillsArray = candidate.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        skills = skillsArray.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('');
      }
    }
    
    // Clean up title - if it contains too much info, extract just the job title part
    let displayTitle = candidate.title || 'No title specified';
    if (displayTitle.length > 50) {
      // If title is very long, it might contain concatenated data
      displayTitle = displayTitle.substring(0, 50) + '...';
    }
    
         const cardHTML = `
       <div class="candidate-avatar" data-morph>${initials}</div>
       <h3 class="candidate-name">${candidate.name || 'Unknown Name'}</h3>
       <p class="candidate-title">${displayTitle}</p>
       <div class="candidate-skills">
         ${skills}
       </div>
       <div class="candidate-meta">
         <span class="candidate-location"><i class="fas fa-map-marker-alt"></i> ${candidate.location || 'Location not specified'}</span>
         <span class="candidate-experience"><i class="fas fa-clock"></i> ${candidate.experience || 'Experience not specified'}</span>
       </div>
       <div class="candidate-actions">
         <button class="btn-icon" title="View Details" onclick="viewCandidateDetails('${candidate.id || 'unknown'}')">
           <i class="fas fa-eye"></i>
         </button>
         <button class="btn-icon" title="Contact" onclick="contactCandidate('${candidate.id || 'unknown'}')">
           <i class="fas fa-envelope"></i>
         </button>
         <button class="btn-icon" title="Archive" onclick="archiveCandidate('${candidate.id || 'unknown'}')">
           <i class="fas fa-archive"></i>
         </button>
       </div>
     `;
     
     console.log('Generated card HTML:', cardHTML);
     card.innerHTML = cardHTML;
    
    return card;
  } catch (error) {
    console.error('Error creating candidate card:', error, candidate);
    // Return a fallback card
    const fallbackCard = document.createElement('div');
    fallbackCard.className = 'candidate-card error';
    fallbackCard.innerHTML = `
      <div class="candidate-avatar" data-morph>?</div>
      <h3 class="candidate-name">Error Loading Candidate</h3>
      <p class="candidate-title">Data format issue</p>
      <div class="candidate-skills">
        <em>Unable to display skills</em>
      </div>
      <div class="candidate-meta">
        <span class="candidate-location"><i class="fas fa-exclamation-triangle"></i> Data Error</span>
      </div>
    `;
    return fallbackCard;
  }
}

// Function to show loading state
function showCandidatesLoading() {
  const loadingState = document.getElementById('candidatesLoading');
  const emptyState = document.getElementById('candidatesEmpty');
  const candidatesGrid = document.getElementById('candidatesGrid');
  
  if (loadingState) loadingState.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';
  if (candidatesGrid) candidatesGrid.innerHTML = '';
}

// Function to show empty state
function showCandidatesEmpty() {
  const loadingState = document.getElementById('candidatesLoading');
  const emptyState = document.getElementById('candidatesEmpty');
  const candidatesGrid = document.getElementById('candidatesGrid');
  
  if (loadingState) loadingState.style.display = 'none';
  if (emptyState) emptyState.style.display = 'block';
  if (candidatesGrid) candidatesGrid.innerHTML = '';
}

// Function to view candidate details
function viewCandidateDetails(candidateId) {
  const candidate = candidatesData.find(c => c.id === candidateId);
  if (!candidate) return;
  
  showNotification(`Viewing details for ${candidate.name}`, 'info');
  // TODO: Implement detailed candidate view modal
}

// Function to contact candidate
function contactCandidate(candidateId) {
  const candidate = candidatesData.find(c => c.id === candidateId);
  if (!candidate) return;
  
  showNotification(`Opening contact form for ${candidate.name}`, 'info');
  // TODO: Implement contact form
}

// Function to archive candidate
function archiveCandidate(candidateId) {
  const candidate = candidatesData.find(c => c.id === candidateId);
  if (!candidate) return;
  
  if (confirm(`Are you sure you want to archive ${candidate.name}?`)) {
    showNotification(`Archiving ${candidate.name}...`, 'info');
    // TODO: Implement archive functionality
  }
}

// Function to filter candidates
function filterCandidates() {
  const statusFilter = document.querySelector('[data-track="candidate-status-filter"]').value;
  const sortFilter = document.querySelector('[data-track="candidate-sort"]').value;
  
  let filteredCandidates = [...candidatesData];
  
  // Apply status filter
  if (statusFilter === 'active') {
    filteredCandidates = filteredCandidates.filter(candidate => !candidate.isArchived);
  } else if (statusFilter === 'archived') {
    filteredCandidates = filteredCandidates.filter(candidate => candidate.isArchived);
  }
  
  // Apply sorting
  filteredCandidates.sort((a, b) => {
    switch (sortFilter) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'date':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'skills':
        return (b.skills?.length || 0) - (a.skills?.length || 0);
      default:
        return 0;
    }
  });
  
  renderFilteredCandidates(filteredCandidates);
}

// Function to render filtered candidates
function renderFilteredCandidates(filteredCandidates) {
  const candidatesGrid = document.getElementById('candidatesGrid');
  if (!candidatesGrid) return;
  
  candidatesGrid.innerHTML = '';
  
  if (filteredCandidates.length === 0) {
    candidatesGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size: 2rem; margin-bottom: var(--space-4);">🔍</div>
        <h3 style="margin-bottom: var(--space-2); color: var(--color-text-primary);">No Candidates Found</h3>
        <p style="color: var(--color-text-secondary);">
          Try adjusting your filters or upload more resumes.
        </p>
      </div>
    `;
    return;
  }
  
  filteredCandidates.forEach(candidate => {
    const candidateCard = createCandidateCard(candidate);
    candidatesGrid.appendChild(candidateCard);
  });
}

// Initialize candidate management functionality
function initializeCandidateManagement() {
  console.log('initializeCandidateManagement: Starting initialization...');
  
  // Add event listeners for candidate filters
  const statusFilter = document.querySelector('[data-track="candidate-status-filter"]');
  const sortFilter = document.querySelector('[data-track="candidate-sort"]');
  
  console.log('initializeCandidateManagement: Found filters:', {
    statusFilter: !!statusFilter,
    sortFilter: !!sortFilter
  });
  
  if (statusFilter) {
    statusFilter.addEventListener('change', filterCandidates);
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', filterCandidates);
  }

  // Load initial candidates
  console.log('initializeCandidateManagement: Loading initial candidates...');
  loadCandidates();
}

// ===== AI TOOLS FUNCTIONALITY =====

// Initialize AI tools functionality
function initializeAITools() {
  console.log('🧠 Initializing AI Tools...');
  
  // Add event listeners for AI tool buttons
  const aiToolButtons = document.querySelectorAll('.ai-tool-btn');
  aiToolButtons.forEach(button => {
    button.addEventListener('click', handleAIToolClick);
  });
  
  console.log(`✅ AI Tools initialized with ${aiToolButtons.length} buttons`);
}

// Handle AI tool button clicks
function handleAIToolClick(event) {
  const button = event.currentTarget;
  const toolType = button.getAttribute('data-track')?.replace('use-ai-', '');
  
  if (!toolType) {
    showNotification('Unknown AI tool', 'error');
    return;
  }
  
  // Show candidate and job selection modal
  showAISelectionModal(toolType);
}

// Show AI selection modal
function showAISelectionModal(toolType) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Select Candidate and Job for ${getToolDisplayName(toolType)}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="ai-candidate-select">Candidate:</label>
          <select id="ai-candidate-select" class="form-select">
            <option value="">Select a candidate...</option>
            ${candidatesData.map(c => `<option value="${c.id}">${c.name} - ${c.title}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="ai-job-select">Job:</label>
          <select id="ai-job-select" class="form-select">
            <option value="">Select a job...</option>
            ${jobsData.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="runAIAnalysis('${toolType}')">
          <i class="fas fa-magic"></i>
          Run Analysis
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Get display name for AI tool
function getToolDisplayName(toolType) {
  const toolNames = {
    'matching': 'Smart Candidate Matching',
    'skills': 'Skills Gap Analysis',
    'interview': 'Interview Question Generator',
    'cultural': 'Cultural Fit Assessment'
  };
  return toolNames[toolType] || toolType;
}

// Run AI analysis
async function runAIAnalysis(toolType) {
  const candidateId = document.getElementById('ai-candidate-select').value;
  const jobId = document.getElementById('ai-job-select').value;
  
  if (!candidateId || !jobId) {
    showNotification('Please select both a candidate and a job', 'error');
    return;
  }
  
  // Close the modal
  document.querySelector('.modal-overlay').remove();
  
  // Show loading state
  showNotification(`Running ${getToolDisplayName(toolType)}...`, 'info');
  
  try {
    let result;
    const requestBody = { candidateId, jobId };
    
    switch (toolType) {
      case 'matching':
        result = await fetch('/api/role-alignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        break;
        
      case 'skills':
        result = await fetch('/api/skills-gap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        break;
        
      case 'interview':
        result = await fetch('/api/interview-questions/categorized', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        break;
        
      case 'cultural':
        result = await fetch('/api/cultural-fit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        break;
        
      default:
        throw new Error('Unknown AI tool type');
    }
    
    const data = await result.json();
    
    if (data.success) {
      showAIAnalysisResults(toolType, data);
    } else {
      showNotification(`Analysis failed: ${data.error}`, 'error');
    }
    
  } catch (error) {
    console.error('AI analysis error:', error);
    showNotification('Analysis failed. Please try again.', 'error');
  }
}

// Show AI analysis results
function showAIAnalysisResults(toolType, data) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  
  let content = '';
  
  switch (toolType) {
    case 'matching':
      content = `
        <div class="modal-header">
          <h3>🎯 Role Alignment Results</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="ai-result-card">
            <div class="ai-score">
              <div class="score-circle" style="background: conic-gradient(var(--color-primary) 0deg ${data.alignment?.overallScore * 3.6}deg, var(--color-border) 0deg);">
                <span class="score-text">${data.alignment?.overallScore || 0}%</span>
              </div>
              <h4>Overall Match</h4>
            </div>
            <div class="ai-breakdown">
              <div class="breakdown-item">
                <span class="label">Technical Skills:</span>
                <span class="value">${data.alignment?.technicalScore || 0}%</span>
              </div>
              <div class="breakdown-item">
                <span class="label">Experience:</span>
                <span class="value">${data.alignment?.experienceScore || 0}%</span>
              </div>
              <div class="breakdown-item">
                <span class="label">Cultural Fit:</span>
                <span class="value">${data.alignment?.culturalScore || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'skills':
      content = `
        <div class="modal-header">
          <h3>📊 Skills Gap Analysis</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="skills-gap-results">
            <div class="gap-section">
              <h4>✅ Strong Skills</h4>
              <div class="skills-list">
                ${(data.skillsGap?.strongSkills || []).map(skill => `<span class="skill-tag strong">${skill}</span>`).join('')}
              </div>
            </div>
            <div class="gap-section">
              <h4>⚠️ Skills to Develop</h4>
              <div class="skills-list">
                ${(data.skillsGap?.skillsToDevelop || []).map(skill => `<span class="skill-tag weak">${skill}</span>`).join('')}
            </div>
            </div>
            <div class="gap-section">
              <h4>📈 Development Recommendations</h4>
              <ul class="recommendations">
                ${(data.skillsGap?.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'interview':
      content = `
        <div class="modal-header">
          <h3>💬 Interview Questions</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="questions-container">
            <div class="question-category">
              <h4>🔧 Technical Questions (${data.categorizedQuestions?.technical?.length || 0})</h4>
              <ol class="questions-list">
                ${(data.categorizedQuestions?.technical || []).map(q => `<li>${q}</li>`).join('')}
              </ol>
            </div>
            <div class="question-category">
              <h4>💼 Experience Questions (${data.categorizedQuestions?.experience?.length || 0})</h4>
              <ol class="questions-list">
                ${(data.categorizedQuestions?.experience || []).map(q => `<li>${q}</li>`).join('')}
              </ol>
            </div>
            <div class="question-category">
              <h4>🧠 Problem Solving (${data.categorizedQuestions?.problemSolving?.length || 0})</h4>
              <ol class="questions-list">
                ${(data.categorizedQuestions?.problemSolving || []).map(q => `<li>${q}</li>`).join('')}
              </ol>
            </div>
            <div class="question-category">
              <h4>👥 Cultural Fit (${data.categorizedQuestions?.cultural?.length || 0})</h4>
              <ol class="questions-list">
                ${(data.categorizedQuestions?.cultural || []).map(q => `<li>${q}</li>`).join('')}
              </ol>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'cultural':
      content = `
        <div class="modal-header">
          <h3>🔍 Cultural Fit Assessment</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="cultural-fit-results">
            <div class="fit-score">
              <div class="score-circle" style="background: conic-gradient(var(--color-primary) 0deg ${data.culturalFit?.fitScore * 3.6}deg, var(--color-border) 0deg);">
                <span class="score-text">${data.culturalFit?.fitScore || 0}%</span>
              </div>
              <h4>Cultural Fit Score</h4>
            </div>
            <div class="fit-breakdown">
              <div class="breakdown-item">
                <span class="label">Values Alignment:</span>
                <span class="value">${data.culturalFit?.valuesAlignment || 0}%</span>
              </div>
              <div class="breakdown-item">
                <span class="label">Work Style:</span>
                <span class="value">${data.culturalFit?.workStyle || 0}%</span>
              </div>
              <div class="breakdown-item">
                <span class="label">Team Dynamics:</span>
                <span class="value">${data.culturalFit?.teamDynamics || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
  }
  
  modal.innerHTML = `
    <div class="modal-content ai-results-modal">
      ${content}
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        <button class="btn btn-primary" onclick="exportAIResults('${toolType}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">
          <i class="fas fa-download"></i>
          Export Results
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Export AI results
function exportAIResults(toolType, data) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${toolType}-analysis-${timestamp}.json`;
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Results exported successfully!', 'success');
}

// ===== ANALYTICS FUNCTIONALITY =====

// Initialize analytics charts
function initializeAnalytics() {
  console.log('📊 Initializing Analytics...');
  
  // Load hiring funnel chart
  loadHiringFunnel();
  
  // Load time to hire chart
  loadTimeToHire();
  
  console.log('✅ Analytics initialized');
}

// Load hiring funnel data and render chart
async function loadHiringFunnel() {
  try {
    const response = await fetch('/api/analytics/hiring-funnel');
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        renderHiringFunnelChart(result.data);
      } else {
        showAnalyticsError('hiringFunnelChart', 'Failed to load hiring funnel data');
      }
    } else {
      showAnalyticsError('hiringFunnelChart', 'Failed to fetch hiring funnel data');
    }
  } catch (error) {
    console.error('Error loading hiring funnel:', error);
    showAnalyticsError('hiringFunnelChart', 'Error loading hiring funnel data');
  }
}

// Render hiring funnel chart
function renderHiringFunnelChart(data) {
  const chartContainer = document.getElementById('hiringFunnelChart');
  if (!chartContainer) return;
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Create funnel chart HTML
  const chartHTML = `
    <div class="funnel-chart">
      ${data.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const width = Math.max(20, 100 - (index * 15)); // Decreasing width for funnel effect
        
        return `
          <div class="funnel-stage clickable" style="width: ${width}%" onclick="openFunnelStageModal('${item.stage}')">
            <div class="funnel-bar">
              <div class="funnel-fill" style="width: 100%; background: var(--color-primary-${Math.max(100, 500 - index * 100)})"></div>
            </div>
            <div class="funnel-label">
              <span class="stage-name">${item.stage}</span>
              <span class="stage-count">${item.count}</span>
              <span class="stage-percentage">${percentage}%</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  chartContainer.innerHTML = chartHTML;
}

// Load time to hire data and render chart
async function loadTimeToHire() {
  console.log('🔄 loadTimeToHire: Starting to fetch data...');
  try {
    const response = await fetch('/api/analytics/time-to-hire');
    console.log('📡 loadTimeToHire: Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 loadTimeToHire: API response:', result);
      
      if (result.success) {
        console.log('✅ loadTimeToHire: Data loaded successfully, calling renderTimeToHireChart');
        renderTimeToHireChart(result.data);
      } else {
        console.error('❌ loadTimeToHire: API returned success: false');
        showAnalyticsError('timeToHireChart', 'Failed to load time to hire data');
      }
    } else {
      console.error('❌ loadTimeToHire: HTTP error:', response.status);
      showAnalyticsError('timeToHireChart', 'Failed to fetch time to hire data');
    }
  } catch (error) {
    console.error('❌ loadTimeToHire: Error:', error);
    showAnalyticsError('timeToHireChart', 'Error loading time to hire data');
  }
}

// Render time to hire chart
function renderTimeToHireChart(data) {
  console.log('🔍 renderTimeToHireChart called with data:', data);
  
  const chartContainer = document.getElementById('timeToHireChart');
  if (!chartContainer) {
    console.error('❌ timeToHireChart container not found');
    return;
  }
  
  console.log('📊 Chart container found, rendering chart...');
  console.log('📈 Monthly hires data:', data.monthlyHires);
  
  // Create time to hire chart HTML
  const chartHTML = `
    <div class="time-to-hire-chart">
      <div class="metric-card">
        <div class="metric-value">${data.averageTimeToHire}</div>
        <div class="metric-label">Average Days to Hire</div>
        <div class="metric-trend ${data.trend}">
          <i class="fas fa-${data.trend === 'improving' ? 'arrow-down' : 'arrow-up'}"></i>
          ${data.trend === 'improving' ? 'Improving' : 'Needs Attention'}
        </div>
      </div>
      
      <div class="monthly-chart">
        <h4>Monthly Hires Trend</h4>
        <div class="chart-bars">
          ${data.monthlyHires.map(item => {
            const maxHires = Math.max(...data.monthlyHires.map(m => m.count));
            const height = maxHires > 0 ? (item.count / maxHires) * 200 : 0; // Use 200px as base height
            
            return `
              <div class="chart-bar">
                <div class="bar-fill" style="height: ${height}px; min-height: 8px;"></div>
                <div class="bar-label">${item.month}</div>
                <div class="bar-value">${item.count}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="metrics-summary">
        <div class="metric-item">
          <div class="metric-number">${data.totalHires}</div>
          <div class="metric-text">Total Hires</div>
        </div>
        <div class="metric-item">
          <div class="metric-number">${data.avgHiresPerMonth}</div>
          <div class="metric-text">Avg/Month</div>
        </div>
        <div class="metric-item">
          <div class="metric-number">${data.yearToDate}</div>
          <div class="metric-text">YTD Hires</div>
        </div>
        <div class="metric-item">
          <div class="metric-number">${data.conversionRate}</div>
          <div class="metric-text">Conversion</div>
        </div>
      </div>
      
      <div class="performance-insights">
        <div class="insight-item">
          <i class="fas fa-trophy"></i>
          <span>Best Month: ${data.bestMonth.month} (${data.bestMonth.count} hires)</span>
        </div>
        <div class="insight-item">
          <i class="fas fa-chart-line"></i>
          <span>Cost per Hire: $${data.costPerHire.toLocaleString()}</span>
        </div>
        <div class="insight-item">
          <i class="fas fa-star"></i>
          <span>Quality Score: ${data.qualityOfHire}/5.0</span>
        </div>
      </div>
    </div>
  `;
  
  console.log('📝 Generated chart HTML length:', chartHTML.length);
  
  // Force visibility with inline styles to override any CSS conflicts
  chartContainer.style.display = 'block';
  chartContainer.style.visibility = 'visible';
  chartContainer.style.opacity = '1';
  chartContainer.style.height = 'auto';
  chartContainer.style.overflow = 'visible';
  
  chartContainer.innerHTML = chartHTML;
  console.log('✅ Chart rendered successfully');
  
  // Additional debugging to check DOM elements
  setTimeout(() => {
    const chartBars = chartContainer.querySelectorAll('.chart-bar');
    const barFills = chartContainer.querySelectorAll('.bar-fill');
    console.log('🔍 DOM Check - Chart bars found:', chartBars.length);
    console.log('🔍 DOM Check - Bar fills found:', barFills.length);
    
    if (chartBars.length > 0) {
      console.log('🔍 First chart bar element:', chartBars[0]);
      console.log('🔍 First bar fill element:', barFills[0]);
      console.log('🔍 First bar fill computed height:', window.getComputedStyle(barFills[0]).height);
      console.log('🔍 First bar fill computed width:', window.getComputedStyle(barFills[0]).width);
    }
  }, 100);
}

// Show analytics error
function showAnalyticsError(chartId, message) {
  const chartContainer = document.getElementById(chartId);
  if (chartContainer) {
    chartContainer.innerHTML = `
      <div class="chart-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <button class="btn btn-sm" onclick="refresh${chartId.charAt(0).toUpperCase() + chartId.slice(1)}()">
          <i class="fas fa-sync-alt"></i>
          Retry
        </button>
      </div>
    `;
  }
}

// Refresh functions for analytics
function refreshHiringFunnel() {
  const chartContainer = document.getElementById('hiringFunnelChart');
  if (chartContainer) {
    chartContainer.innerHTML = `
      <div class="chart-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Refreshing hiring funnel data...</p>
      </div>
    `;
  }
  loadHiringFunnel();
}

function refreshTimeToHire() {
  const chartContainer = document.getElementById('timeToHireChart');
  if (chartContainer) {
    chartContainer.innerHTML = `
      <div class="chart-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Refreshing time to hire data...</p>
      </div>
    `;
  }
  loadTimeToHire();
}

// Global functions for analytics
window.refreshHiringFunnel = refreshHiringFunnel;
window.refreshTimeToHire = refreshTimeToHire;
window.openFunnelStageModal = openFunnelStageModal;
window.switchFunnelTab = switchFunnelTab;
window.closeHiringFunnelModal = closeHiringFunnelModal;
window.exportStageData = exportStageData;

// ===== HIRING FUNNEL MODAL FUNCTIONS =====

// Open funnel stage modal
async function openFunnelStageModal(stage) {
  try {
    const response = await fetch(`/api/analytics/funnel-stage/${encodeURIComponent(stage)}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        populateFunnelModal(stage, result.data);
        document.getElementById('hiringFunnelModal').style.display = 'flex';
      } else {
        console.error('Failed to load stage details:', result.error);
      }
    } else {
      console.error('Failed to fetch stage details');
    }
  } catch (error) {
    console.error('Error opening funnel stage modal:', error);
  }
}

// Populate funnel modal with data
function populateFunnelModal(stage, data) {
  // Update modal title
  document.getElementById('funnelStageName').textContent = stage;
  
  // Update stage metrics
  document.getElementById('stageCount').textContent = data.candidates.length;
  document.getElementById('stagePercentage').textContent = data.conversionRate;
  document.getElementById('stageAvgTime').textContent = data.avgTimeInStage;
  document.getElementById('stageSuccessRate').textContent = data.successRate;
  
  // Update analytics tab metrics
  document.getElementById('stageDropoffRate').textContent = data.dropoffRate;
  document.getElementById('stageBottleneck').textContent = data.isBottleneck ? 'Yes' : 'No';
  document.getElementById('stageEfficiency').textContent = data.efficiency;
  
  // Populate candidates tab
  populateCandidatesTab(data.candidates);
  
  // Populate insights tab
  populateInsightsTab(data.insights);
  
  // Set active tab to candidates
  switchFunnelTab('candidates', null);
}

// Populate candidates tab
function populateCandidatesTab(candidates) {
  const candidatesList = document.getElementById('stageCandidatesList');
  
  if (candidates.length === 0) {
    candidatesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>No candidates in this stage</p>
      </div>
    `;
    return;
  }
  
  const candidatesHTML = candidates.map(candidate => `
    <div class="candidate-item">
      <div class="candidate-avatar">
        ${candidate.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div class="candidate-info">
        <div class="candidate-name">${candidate.name}</div>
        <div class="candidate-title">${candidate.title}</div>
        <div class="candidate-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${candidate.location}</span>
          <span><i class="fas fa-clock"></i> ${candidate.daysInStage || 0} days</span>
        </div>
      </div>
      <div class="candidate-status ${candidate.status}">${candidate.status}</div>
    </div>
  `).join('');
  
  candidatesList.innerHTML = candidatesHTML;
}

// Populate insights tab
function populateInsightsTab(insights) {
  const insightsContainer = document.getElementById('stageInsights');
  
  const insightsHTML = insights.map(insight => `
    <div class="insight-card ${insight.type}">
      <div class="insight-header">
        <div class="insight-icon">
          <i class="fas fa-${insight.type === 'success' ? 'check' : insight.type === 'warning' ? 'exclamation-triangle' : 'times'}"></i>
        </div>
        <div class="insight-title">${insight.title}</div>
      </div>
      <div class="insight-description">${insight.description}</div>
    </div>
  `).join('');
  
  insightsContainer.innerHTML = insightsHTML;
}

// Switch funnel modal tabs
function switchFunnelTab(tabName, event) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Close hiring funnel modal
function closeHiringFunnelModal() {
  document.getElementById('hiringFunnelModal').style.display = 'none';
}

// Export stage data
function exportStageData() {
  const stageName = document.getElementById('funnelStageName').textContent;
  const data = {
    stage: stageName,
    timestamp: new Date().toISOString(),
    metrics: {
      count: document.getElementById('stageCount').textContent,
      conversionRate: document.getElementById('stagePercentage').textContent,
      avgTime: document.getElementById('stageAvgTime').textContent,
      successRate: document.getElementById('stageSuccessRate').textContent
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${stageName.toLowerCase().replace(/\s+/g, '-')}-data.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Time to Hire Modal Functions
function openTimeToHireModal() {
  console.log('🔍 openTimeToHireModal: Opening modal...');
  const modal = document.getElementById('timeToHireModal');
  if (modal) {
    modal.style.display = 'flex';
    loadTimeToHireModalData();
  } else {
    console.error('❌ timeToHireModal not found');
  }
}

function closeTimeToHireModal() {
  console.log('🔍 closeTimeToHireModal: Closing modal...');
  const modal = document.getElementById('timeToHireModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function refreshTimeToHireModal() {
  console.log('🔍 refreshTimeToHireModal: Refreshing modal data...');
  loadTimeToHireModalData();
}

async function loadTimeToHireModalData() {
  console.log('🔄 loadTimeToHireModalData: Loading data for modal...');
  try {
    const response = await fetch('/api/analytics/time-to-hire');
    console.log('📡 loadTimeToHireModalData: Response status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('📊 loadTimeToHireModalData: API response:', result);
      if (result.success) {
        console.log('✅ loadTimeToHireModalData: Data loaded successfully, populating modal');
        populateTimeToHireModal(result.data);
      } else {
        console.error('❌ loadTimeToHireModalData: API returned success: false');
        showModalError('Failed to load time to hire data');
      }
    } else {
      console.error('❌ loadTimeToHireModalData: HTTP error:', response.status);
      showModalError('Failed to fetch time to hire data');
    }
  } catch (error) {
    console.error('❌ loadTimeToHireModalData: Error:', error);
    showModalError('Error loading time to hire data');
  }
}

function populateTimeToHireModal(data) {
  console.log('🔍 populateTimeToHireModal: Populating modal with data:', data);
  const modalContent = document.getElementById('timeToHireModalContent');
  if (!modalContent) {
    console.error('❌ timeToHireModalContent not found');
    return;
  }

  // Calculate additional metrics
  const totalHires = data.monthlyHires.reduce((sum, month) => sum + month.count, 0);
  const avgHiresPerMonth = totalHires / data.monthlyHires.length;
  const maxHires = Math.max(...data.monthlyHires.map(m => m.count));
  const minHires = Math.min(...data.monthlyHires.map(m => m.count));
  
  // Calculate trends
  const recentMonths = data.monthlyHires.slice(-3);
  const previousMonths = data.monthlyHires.slice(-6, -3);
  const recentAvg = recentMonths.reduce((sum, m) => sum + m.count, 0) / recentMonths.length;
  const previousAvg = previousMonths.reduce((sum, m) => sum + m.count, 0) / previousMonths.length;
  const trend = recentAvg > previousAvg ? 'positive' : recentAvg < previousAvg ? 'negative' : 'neutral';
  const trendPercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1) : 0;

  const modalHTML = `
    <div class="time-to-hire-metrics">
      <div class="time-to-hire-metric">
        <div class="time-to-hire-metric-value">${data.averageTimeToHire}</div>
        <div class="time-to-hire-metric-label">Average Days to Hire</div>
      </div>
      <div class="time-to-hire-metric">
        <div class="time-to-hire-metric-value">${totalHires}</div>
        <div class="time-to-hire-metric-label">Total Hires</div>
      </div>
      <div class="time-to-hire-metric">
        <div class="time-to-hire-metric-value">${avgHiresPerMonth.toFixed(1)}</div>
        <div class="time-to-hire-metric-label">Avg Hires per Month</div>
      </div>
      <div class="time-to-hire-metric">
        <div class="time-to-hire-metric-value">${maxHires}</div>
        <div class="time-to-hire-metric-label">Peak Month</div>
      </div>
    </div>

    <div class="time-to-hire-trends">
      <div class="time-to-hire-trend">
        <div class="trend-icon ${trend}">
          <i class="fas fa-${trend === 'positive' ? 'arrow-up' : trend === 'negative' ? 'arrow-down' : 'minus'}"></i>
        </div>
        <div class="trend-content">
          <h5>Hiring Trend</h5>
          <p>${trend === 'positive' ? 'Increasing' : trend === 'negative' ? 'Decreasing' : 'Stable'} (${trendPercentage}%)</p>
        </div>
      </div>
      <div class="time-to-hire-trend">
        <div class="trend-icon neutral">
          <i class="fas fa-calendar"></i>
        </div>
        <div class="trend-content">
          <h5>Best Month</h5>
          <p>${data.monthlyHires.find(m => m.count === maxHires)?.month || 'N/A'} (${maxHires} hires)</p>
        </div>
      </div>
      <div class="time-to-hire-trend">
        <div class="trend-icon neutral">
          <i class="fas fa-clock"></i>
        </div>
        <div class="trend-content">
          <h5>Efficiency</h5>
          <p>${data.averageTimeToHire <= 30 ? 'Excellent' : data.averageTimeToHire <= 45 ? 'Good' : 'Needs Improvement'}</p>
        </div>
      </div>
    </div>

    <div class="chart-card time-to-hire-chart-section">
      <h4>Monthly Hires Trend</h4>
      <div class="chart-panel chart-bars">
        ${data.monthlyHires.map(item => {
          // Calculate height with proper y-axis headroom and top padding
          const maxCount = Math.max(...data.monthlyHires.map(m => m.count));
          // Add headroom by using maxCount + 2 for domain, and ensure proper top padding
          const availableHeight = 280; // Reduced from 300 to account for top padding
          const height = maxCount > 0 ? Math.max(16, (item.count / (maxCount + 2)) * availableHeight) : 16;
          return `
            <div class="chart-bar">
              <div class="bar-fill" style="height: ${height}px; min-height: 16px; max-height: ${availableHeight}px;"></div>
              <div class="bar-label">${item.month}</div>
              <div class="bar-value">${item.count}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="time-to-hire-insights">
      <div class="time-to-hire-insight-card">
        <div class="time-to-hire-insight-title">Hiring Efficiency</div>
        <div class="time-to-hire-insight-description">
          ${data.averageTimeToHire <= 30 ? 'Your hiring process is highly efficient with an average time to hire of ' + data.averageTimeToHire + ' days. This is well below industry standards.' : 
            data.averageTimeToHire <= 45 ? 'Your hiring process is performing well with an average time to hire of ' + data.averageTimeToHire + ' days. Consider optimizing bottlenecks to improve further.' : 
            'Your hiring process could benefit from optimization. The current average of ' + data.averageTimeToHire + ' days suggests potential bottlenecks in the recruitment funnel.'}
        </div>
      </div>
      
      <div class="time-to-hire-insight-card">
        <div class="time-to-hire-insight-title">Seasonal Patterns</div>
        <div class="time-to-hire-insight-description">
          ${maxHires > avgHiresPerMonth * 1.5 ? 'There are clear seasonal hiring patterns with ' + data.monthlyHires.find(m => m.count === maxHires)?.month + ' being the peak hiring month. Consider planning recruitment campaigns around these periods.' : 
            'Hiring appears to be relatively consistent throughout the year with no major seasonal spikes. This suggests stable recruitment needs.'}
        </div>
      </div>
      
      <div class="time-to-hire-insight-card">
        <div class="time-to-hire-insight-title">Growth Opportunities</div>
        <div class="time-to-hire-insight-description">
          ${trend === 'positive' ? 'Your hiring is trending upward, indicating growing business needs and effective recruitment strategies. Consider scaling your recruitment team to maintain this momentum.' : 
            trend === 'negative' ? 'Hiring has decreased recently. This could indicate market conditions, business strategy changes, or recruitment challenges that need attention.' : 
            'Hiring has remained stable. This consistency suggests well-established recruitment processes and predictable business growth.'}
        </div>
      </div>
    </div>
  `;

  console.log('📝 Generated modal HTML length:', modalHTML.length);
  modalContent.innerHTML = modalHTML;
  console.log('✅ Modal populated successfully');
}

function showModalError(message) {
  const modalContent = document.getElementById('timeToHireModalContent');
  if (modalContent) {
    modalContent.innerHTML = `
      <div class="error-message" style="text-align: center; padding: var(--space-8); color: var(--color-error-600);">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: var(--space-4);"></i>
        <h4>Error Loading Data</h4>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="loadTimeToHireModalData()">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
  }
}

// Make functions globally available
window.openTimeToHireModal = openTimeToHireModal;
window.closeTimeToHireModal = closeTimeToHireModal;
window.refreshTimeToHireModal = refreshTimeToHireModal;

// Debug function for chart container styles - run in console
function debugChartContainer() {
  console.log('🔍 Debugging chart container styles...');
  
  // Try different selectors to find the chart
  const selectors = [
    '.time-to-hire-chart',
    '.time-to-hire-chart-section',
    '.monthly-chart',
    '.chart-bars',
    '#timeToHireChart'
  ];
  
  let chartElement = null;
  for (const selector of selectors) {
    chartElement = document.querySelector(selector);
    if (chartElement) {
      console.log(`✅ Found chart element with selector: ${selector}`);
      break;
    }
  }
  
  if (!chartElement) {
    console.log('❌ No chart element found with any selector');
    return;
  }
  
  // Debug the element hierarchy
  let n = chartElement;
  let level = 0;
  
  while (n && level < 10) {
    const cs = getComputedStyle(n);
    console.log(`Level ${level}:`, n.tagName, n.className, {
      overflow: cs.overflow,
      clipPath: cs.clipPath,
      mask: cs.maskImage,
      borderRadius: cs.borderRadius,
      height: cs.height,
      minHeight: cs.minHeight,
      maxHeight: cs.maxHeight,
      paddingTop: cs.paddingTop,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity
    });
    
    n = n.parentElement;
    level++;
  }
  
  // Also check for any conflicting CSS rules
  console.log('🔍 Checking for potential CSS conflicts...');
  const allCharts = document.querySelectorAll('[class*="chart"]');
  console.log(`Found ${allCharts.length} elements with "chart" in class name`);
  
  allCharts.forEach((el, index) => {
    if (index < 5) { // Limit output
      const cs = getComputedStyle(el);
      console.log(`Chart element ${index}:`, el.className, {
        overflow: cs.overflow,
        height: cs.height,
        minHeight: cs.minHeight
      });
    }
  });
}

// Make function globally available
window.debugChartContainer = debugChartContainer;
