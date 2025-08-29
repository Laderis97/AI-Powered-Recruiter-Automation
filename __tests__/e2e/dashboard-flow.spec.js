/**
 * E2E tests for Dashboard Flow
 * Tests the complete user journey from login to candidate management
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:1000');

    // Wait for the page to load
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });
  });

  test('should display dashboard with all main sections', async ({ page }) => {
    // Check main dashboard sections
    await expect(page.locator('.dashboard-header')).toBeVisible();
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('.charts-section')).toBeVisible();
    await expect(page.locator('.recent-activity')).toBeVisible();

    // Check key metrics are displayed
    await expect(page.locator('text=Total Candidates')).toBeVisible();
    await expect(page.locator('text=Active Jobs')).toBeVisible();
    await expect(page.locator('text=Time to Hire')).toBeVisible();
    await expect(page.locator('text=Hiring Funnel')).toBeVisible();
  });

  test('should navigate through hiring funnel stages', async ({ page }) => {
    // Click on hiring funnel section
    await page.click('.hiring-funnel');

    // Wait for funnel modal to open
    await page.waitForSelector('.funnel-modal', { timeout: 5000 });

    // Check all funnel stages are visible
    await expect(page.locator('text=Applied')).toBeVisible();
    await expect(page.locator('text=Screening')).toBeVisible();
    await expect(page.locator('text=Interview')).toBeVisible();
    await expect(page.locator('text=Offer')).toBeVisible();
    await expect(page.locator('text=Hired')).toBeVisible();

    // Click on a specific stage to see candidates
    await page.click('text=Screening');

    // Wait for candidates list to load
    await page.waitForSelector('.candidates-list', { timeout: 5000 });

    // Verify candidates are displayed
    await expect(page.locator('.candidate-card')).toHaveCount.greaterThan(0);

    // Close modal
    await page.click('.modal-close');
  });

  test('should view candidate details and update status', async ({ page }) => {
    // Navigate to candidates section
    await page.click('text=Candidates');

    // Wait for candidates page to load
    await page.waitForSelector('.candidates-container', { timeout: 5000 });

    // Click on first candidate card
    await page.click('.candidate-card:first-child');

    // Wait for candidate modal to open
    await page.waitForSelector('.candidate-modal', { timeout: 5000 });

    // Check candidate information is displayed
    await expect(page.locator('.candidate-name')).toBeVisible();
    await expect(page.locator('.candidate-email')).toBeVisible();
    await expect(page.locator('.candidate-skills')).toBeVisible();

    // Update candidate status
    await page.selectOption('.status-selector', 'interviewing');

    // Save changes
    await page.click('text=Save Changes');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();

    // Close modal
    await page.click('.modal-close');
  });

  test('should create new job posting', async ({ page }) => {
    // Navigate to jobs section
    await page.click('text=Jobs');

    // Wait for jobs page to load
    await page.waitForSelector('.jobs-container', { timeout: 5000 });

    // Click create new job button
    await page.click('text=Create Job');

    // Wait for job form to appear
    await page.waitForSelector('.job-form', { timeout: 5000 });

    // Fill job form
    await page.fill('input[name="title"]', 'Senior Frontend Developer');
    await page.fill('input[name="company"]', 'Tech Innovations Inc');
    await page.fill('input[name="location"]', 'Remote');
    await page.selectOption('select[name="type"]', 'full-time');
    await page.fill('input[name="salary"]', '$120,000 - $150,000');
    await page.fill(
      'textarea[name="description"]',
      'We are looking for a talented frontend developer...'
    );

    // Add requirements
    await page.fill('input[name="requirements"]', 'React');
    await page.keyboard.press('Enter');
    await page.fill('input[name="requirements"]', 'TypeScript');
    await page.keyboard.press('Enter');
    await page.fill('input[name="requirements"]', '5+ years experience');
    await page.keyboard.press('Enter');

    // Submit form
    await page.click('text=Create Job');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();

    // Verify job appears in list
    await expect(page.locator('text=Senior Frontend Developer')).toBeVisible();
  });

  test('should search and filter candidates', async ({ page }) => {
    // Navigate to candidates section
    await page.click('text=Candidates');

    // Wait for candidates page to load
    await page.waitForSelector('.candidates-container', { timeout: 5000 });

    // Search for specific candidate
    await page.fill('.search-input', 'John Doe');
    await page.keyboard.press('Enter');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify search results
    const searchResults = page.locator('.candidate-card');
    await expect(searchResults).toHaveCount.greaterThan(0);

    // Clear search
    await page.fill('.search-input', '');
    await page.keyboard.press('Enter');

    // Apply skill filter
    await page.click('.filter-dropdown');
    await page.click('text=JavaScript');

    // Verify filtered results
    await page.waitForTimeout(1000);
    const filteredResults = page.locator('.candidate-card');
    await expect(filteredResults).toHaveCount.greaterThan(0);
  });

  test('should view analytics and charts', async ({ page }) => {
    // Navigate to analytics section
    await page.click('text=Analytics');

    // Wait for analytics page to load
    await page.waitForSelector('.analytics-container', { timeout: 5000 });

    // Check charts are visible
    await expect(page.locator('.chart-container')).toBeVisible();
    await expect(page.locator('.time-to-hire-chart')).toBeVisible();
    await expect(page.locator('.monthly-hires-chart')).toBeVisible();

    // Check chart legends
    await expect(page.locator('.chart-legend')).toBeVisible();

    // Verify chart data is loaded
    await page.waitForTimeout(2000); // Wait for charts to render

    // Check chart elements exist
    const chartElements = page.locator(
      '.chart-container canvas, .chart-container svg'
    );
    await expect(chartElements).toHaveCount.greaterThan(0);
  });

  test('should handle candidate application workflow', async ({ page }) => {
    // Navigate to applications section
    await page.click('text=Applications');

    // Wait for applications page to load
    await page.waitForSelector('.applications-container', { timeout: 5000 });

    // Click on first application
    await page.click('.application-card:first-child');

    // Wait for application modal to open
    await page.waitForSelector('.application-modal', { timeout: 5000 });

    // Check application details
    await expect(page.locator('.candidate-info')).toBeVisible();
    await expect(page.locator('.job-info')).toBeVisible();
    await expect(page.locator('.application-status')).toBeVisible();

    // Update application status
    await page.selectOption('.application-status-selector', 'interviewing');

    // Add notes
    await page.fill(
      '.notes-textarea',
      'Strong candidate, schedule technical interview'
    );

    // Save changes
    await page.click('text=Update Application');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();

    // Close modal
    await page.click('.modal-close');
  });

  test('should export candidate data', async ({ page }) => {
    // Navigate to candidates section
    await page.click('text=Candidates');

    // Wait for candidates page to load
    await page.waitForSelector('.candidates-container', { timeout: 5000 });

    // Click export button
    await page.click('text=Export');

    // Wait for export modal
    await page.waitForSelector('.export-modal', { timeout: 5000 });

    // Select export format
    await page.click('input[value="csv"]');

    // Select date range
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');

    // Click export button
    await page.click('text=Export Data');

    // Wait for download to start
    await page.waitForTimeout(2000);

    // Verify export modal closes
    await expect(page.locator('.export-modal')).not.toBeVisible();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to dashboard
    await page.goto('http://localhost:1000');

    // Wait for page to load
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    // Check mobile menu button is visible
    await expect(page.locator('.mobile-menu-button')).toBeVisible();

    // Open mobile menu
    await page.click('.mobile-menu-button');

    // Check mobile menu items
    await expect(page.locator('.mobile-menu')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Candidates')).toBeVisible();
    await expect(page.locator('text=Jobs')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();

    // Close mobile menu
    await page.click('.mobile-menu-button');

    // Verify menu is closed
    await expect(page.locator('.mobile-menu')).not.toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to candidates section
    await page.click('text=Candidates');

    // Wait for candidates page to load
    await page.waitForSelector('.candidates-container', { timeout: 5000 });

    // Simulate network error by intercepting requests
    await page.route('**/api/candidates', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    // Refresh page to trigger error
    await page.reload();

    // Wait for error state
    await page.waitForSelector('.error-message', { timeout: 5000 });

    // Verify error message is displayed
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('text=Something went wrong')).toBeVisible();

    // Check retry button is available
    await expect(page.locator('text=Retry')).toBeVisible();

    // Click retry button
    await page.click('text=Retry');

    // Verify loading state
    await expect(page.locator('.loading-spinner')).toBeVisible();
  });

  test('should maintain user preferences and settings', async ({ page }) => {
    // Navigate to settings
    await page.click('.user-menu');
    await page.click('text=Settings');

    // Wait for settings page to load
    await page.waitForSelector('.settings-container', { timeout: 5000 });

    // Change theme
    await page.click('input[value="dark"]');

    // Change language
    await page.selectOption('select[name="language"]', 'es');

    // Save settings
    await page.click('text=Save Settings');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();

    // Navigate back to dashboard
    await page.click('text=Dashboard');

    // Verify settings are applied
    await page.waitForSelector('.dashboard-container', { timeout: 5000 });

    // Check if dark theme is applied
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark-theme');
  });
});

test.describe('Performance Tests', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Navigate to dashboard
    await page.goto('http://localhost:1000');

    // Wait for page to be fully loaded
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Performance budget: dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals
    const performanceMetrics = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const metrics = {};

          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
          });

          resolve(metrics);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      });
    });

    // FCP should be under 1.5s
    if (performanceMetrics.fcp) {
      expect(performanceMetrics.fcp).toBeLessThan(1500);
    }

    // LCP should be under 2.5s
    if (performanceMetrics.lcp) {
      expect(performanceMetrics.lcp).toBeLessThan(2500);
    }
  });
});

test.describe('Accessibility Tests', () => {
  test('should meet accessibility standards', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:1000');

    // Wait for page to load
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings).toHaveCount.greaterThan(0);

    // Check for alt text on images
    const images = page.locator('img');
    for (let i = 0; i < (await images.count()); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for proper form labels
    const inputs = page.locator('input, select, textarea');
    for (let i = 0; i < (await inputs.count()); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }

    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Check for ARIA labels
    const ariaElements = page.locator('[aria-label], [aria-labelledby]');
    await expect(ariaElements).toHaveCount.greaterThan(0);
  });
});
