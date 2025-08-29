/**
 * Global teardown for E2E tests
 * Runs after all tests to clean up test environment
 */

import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...');

  try {
    // Clean up test data files
    await cleanupTestData();

    // Clean up test artifacts (optional)
    if (process.env.CLEANUP_ARTIFACTS === 'true') {
      await cleanupTestArtifacts();
    }

    // Generate test summary report
    await generateTestSummary();

    console.log('✅ E2E test environment cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    // Don't fail the teardown
  }
}

async function cleanupTestData() {
  console.log('🗑️  Cleaning up test data...');

  const testDataPath = path.join(process.cwd(), 'test-data.json');
  
  if (fs.existsSync(testDataPath)) {
    fs.unlinkSync(testDataPath);
    console.log('✅ Test data file removed');
  }

  // Clean up any other test data files
  const testFiles = [
    'test-candidates.json',
    'test-jobs.json',
    'test-applications.json'
  ];

  testFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

async function cleanupTestArtifacts() {
  console.log('🎬 Cleaning up test artifacts...');

  const artifactDirs = [
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/downloads'
  ];

  artifactDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      // Keep only recent artifacts (last 7 days)
      const files = fs.readdirSync(dirPath);
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < sevenDaysAgo) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  console.log('✅ Test artifacts cleaned up');
}

async function generateTestSummary() {
  console.log('📊 Generating test summary...');

  const testResultsPath = path.join(process.cwd(), 'test-results');
  
  if (!fs.existsSync(testResultsPath)) {
    console.log('⚠️  No test results directory found');
    return;
  }

  try {
    // Read test results
    const e2eResultsPath = path.join(testResultsPath, 'e2e-results.json');
    let summary = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      timestamp: new Date().toISOString()
    };

    if (fs.existsSync(e2eResultsPath)) {
      const results = JSON.parse(fs.readFileSync(e2eResultsPath, 'utf8'));
      
      summary = {
        totalTests: results.suites?.reduce((total, suite) => 
          total + (suite.specs?.length || 0), 0) || 0,
        passed: results.suites?.reduce((total, suite) => 
          total + (suite.specs?.filter(spec => spec.ok).length || 0), 0) || 0,
        failed: results.suites?.reduce((total, suite) => 
          total + (suite.specs?.filter(spec => !spec.ok).length || 0), 0) || 0,
        skipped: 0, // Playwright doesn't have skipped tests by default
        duration: results.duration || 0,
        timestamp: new Date().toISOString()
      };
    }

    // Write summary
    const summaryPath = path.join(testResultsPath, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Generate human-readable summary
    const humanSummary = `
# Test Execution Summary

**Execution Time:** ${new Date(summary.timestamp).toLocaleString()}
**Total Duration:** ${(summary.duration / 1000).toFixed(2)}s

## Results
- **Total Tests:** ${summary.totalTests}
- **Passed:** ${summary.passed} ✅
- **Failed:** ${summary.failed} ❌
- **Skipped:** ${summary.skipped} ⏭️

## Success Rate
**${summary.totalTests > 0 ? ((summary.passed / summary.totalTests) * 100).toFixed(1) : 0}%** of tests passed

---
*Generated automatically by E2E test suite*
    `.trim();

    const humanSummaryPath = path.join(testResultsPath, 'test-summary.md');
    fs.writeFileSync(humanSummaryPath, humanSummary);

    console.log('✅ Test summary generated');
    console.log(`📈 Success Rate: ${summary.totalTests > 0 ? ((summary.passed / summary.totalTests) * 100).toFixed(1) : 0}%`);
  } catch (error) {
    console.error('❌ Error generating test summary:', error.message);
  }
}

export default globalTeardown;
