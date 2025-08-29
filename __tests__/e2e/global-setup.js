/**
 * Global setup for E2E tests
 * Runs before all tests to set up test environment
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
  console.log('🚀 Setting up E2E test environment...');

  // Create test directories
  const testDirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/downloads'
  ];

  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Set up test data
  await setupTestData();

  // Verify application is accessible
  await verifyApplicationAccess();

  console.log('✅ E2E test environment setup complete!');
}

async function setupTestData() {
  console.log('📊 Setting up test data...');

  // This would typically involve:
  // 1. Setting up test database
  // 2. Creating test users
  // 3. Setting up test candidates and jobs
  // 4. Configuring test environment variables

  // For now, we'll just create placeholder test data files
  const testData = {
    candidates: [
      {
        id: 'test-candidate-1',
        name: 'John Doe',
        email: 'john.doe@test.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 3,
        status: 'applied',
        stage: 'screening'
      },
      {
        id: 'test-candidate-2',
        name: 'Jane Smith',
        email: 'jane.smith@test.com',
        skills: ['Python', 'Django', 'PostgreSQL'],
        experience: 5,
        status: 'interviewing',
        stage: 'interview'
      }
    ],
    jobs: [
      {
        id: 'test-job-1',
        title: 'Senior Frontend Developer',
        company: 'Test Corp',
        requirements: ['JavaScript', 'React', 'TypeScript'],
        status: 'open'
      },
      {
        id: 'test-job-2',
        title: 'Backend Developer',
        company: 'Test Corp',
        requirements: ['Python', 'Django', 'PostgreSQL'],
        status: 'open'
      }
    ]
  };

  // Write test data to file for tests to use
  const testDataPath = path.join(process.cwd(), 'test-data.json');
  fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));

  console.log('✅ Test data setup complete');
}

async function verifyApplicationAccess() {
  console.log('🔍 Verifying application accessibility...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Try to access the application
    const response = await page.goto('http://localhost:1000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    if (response && response.ok()) {
      console.log('✅ Application is accessible');
      
      // Check if key elements are present
      await page.waitForSelector('.dashboard-container', { timeout: 10000 });
      console.log('✅ Dashboard is loading correctly');
    } else {
      throw new Error(`Application returned status: ${response?.status()}`);
    }
  } catch (error) {
    console.error('❌ Failed to verify application access:', error.message);
    console.log('💡 Make sure the application is running on http://localhost:1000');
    console.log('💡 Run: npm run dev');
    
    // Don't fail the setup, just warn
    console.warn('⚠️  Continuing with setup, but tests may fail if app is not accessible');
  } finally {
    await browser.close();
  }
}

export default globalSetup;
