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

// ===== RESUME UPLOAD FUNCTIONALITY =====

// Global variables for resume upload
let selectedFiles = [];
let uploadQueue = [];
let parsedResults = [];

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
  // Initialize ModernUI
  const modernUI = new ModernUI();
  
  // Initialize resume upload functionality
  initializeResumeUpload();
  
  // Initialize job management functionality
  initializeJobManagement();
  
  // Initialize candidate management functionality
  initializeCandidateManagement();
  
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
window.openResumeModal = openResumeModal;
window.closeResumeModal = closeResumeModal;
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
let jobsData = [];
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

  const skills = job.skills ? job.skills.split(',').slice(0, 3) : [];
  const skillsDisplay = skills.map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('');
  const moreSkills = job.skills ? job.skills.split(',').length - 3 : 0;

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
  form.querySelector('[name="department"]').value = job.department || '';
  form.querySelector('[name="location"]').value = job.location || '';
  form.querySelector('[name="employmentType"]').value = job.employmentType || '';
  form.querySelector('[name="salary"]').value = job.salary || '';
  form.querySelector('[name="experienceLevel"]').value = job.experienceLevel || '';
  form.querySelector('[name="description"]').value = job.description || '';
  form.querySelector('[name="responsibilities"]').value = job.responsibilities || '';
  form.querySelector('[name="requirements"]').value = job.requirements || '';
  form.querySelector('[name="skills"]').value = job.skills || '';
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

// Global variables for candidate management
let candidatesData = [];

// Function to load candidates from the server
async function loadCandidates() {
  try {
    showCandidatesLoading();
    
    const response = await fetch('/api/candidates');
    if (response.ok) {
      const data = await response.json();
      candidatesData = data || [];
      renderCandidates();
    } else {
      console.error('Failed to load candidates');
      showCandidatesEmpty();
    }
  } catch (error) {
    console.error('Error loading candidates:', error);
    showCandidatesEmpty();
  }
}

// Function to render candidates in the grid
function renderCandidates() {
  const candidatesGrid = document.getElementById('candidatesGrid');
  const loadingState = document.getElementById('candidatesLoading');
  const emptyState = document.getElementById('candidatesEmpty');
  
  if (!candidatesGrid) return;
  
  // Hide loading and empty states
  if (loadingState) loadingState.style.display = 'none';
  if (emptyState) emptyState.style.display = 'none';
  
  // Clear existing content
  candidatesGrid.innerHTML = '';
  
  if (candidatesData.length === 0) {
    showCandidatesEmpty();
    return;
  }
  
  candidatesData.forEach(candidate => {
    const candidateCard = createCandidateCard(candidate);
    candidatesGrid.appendChild(candidateCard);
  });
}

// Function to create a candidate card element
function createCandidateCard(candidate) {
  const card = document.createElement('div');
  card.className = 'candidate-card';
  card.setAttribute('data-stagger', '');
  card.setAttribute('data-track', 'candidate-card');
  card.setAttribute('data-candidate-id', candidate.id);
  
  // Generate initials for avatar
  const initials = candidate.name ? candidate.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  
  // Display skills (limit to 3)
  const skills = candidate.skills && candidate.skills.length > 0 
    ? candidate.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')
    : '<em>No skills detected</em>';
  
  card.innerHTML = `
    <div class="candidate-avatar" data-morph>${initials}</div>
    <h3 class="candidate-name">${candidate.name || 'Unknown Name'}</h3>
    <p class="candidate-title">${candidate.title || 'No title specified'}</p>
    <div class="candidate-skills">
      ${skills}
    </div>
    <div class="candidate-meta">
      <span class="candidate-location"><i class="fas fa-map-marker-alt"></i> ${candidate.location || 'Location not specified'}</span>
      <span class="candidate-experience"><i class="fas fa-clock"></i> ${candidate.experience || 'Experience not specified'}</span>
    </div>
    <div class="candidate-actions">
      <button class="btn-icon" title="View Details" onclick="viewCandidateDetails('${candidate.id}')">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn-icon" title="Contact" onclick="contactCandidate('${candidate.id}')">
        <i class="fas fa-envelope"></i>
      </button>
      <button class="btn-icon" title="Archive" onclick="archiveCandidate('${candidate.id}')">
        <i class="fas fa-archive"></i>
      </button>
    </div>
  `;
  
  return card;
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
  // Add event listeners for candidate filters
  const statusFilter = document.querySelector('[data-track="candidate-status-filter"]');
  const sortFilter = document.querySelector('[data-track="candidate-sort"]');
  
  if (statusFilter) {
    statusFilter.addEventListener('change', filterCandidates);
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', filterCandidates);
  }

  // Load initial candidates
  loadCandidates();
}
