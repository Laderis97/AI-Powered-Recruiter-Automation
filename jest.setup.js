// Jest setup file for AI-Powered Recruiter Automation
// Global test configuration and utilities

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '1001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Global test utilities
global.testUtils = {
  // Wait for a condition to be true
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('waitFor timeout'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  // Create mock data
  createMockCandidate: (overrides = {}) => ({
    id: 'test-candidate-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    status: 'applied',
    stage: 'screening',
    skills: ['JavaScript', 'Node.js', 'React'],
    experience: 3,
    resumeUrl: '/resumes/john-doe.pdf',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  createMockJob: (overrides = {}) => ({
    id: 'test-job-1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    type: 'full-time',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a senior software engineer...',
    requirements: ['5+ years experience', 'JavaScript', 'Node.js'],
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  createMockUser: (overrides = {}) => ({
    id: 'test-user-1',
    email: 'recruiter@company.com',
    name: 'Jane Recruiter',
    role: 'recruiter',
    permissions: ['read', 'write', 'delete'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })
};

// Mock database connections
jest.mock('./src/databaseService', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  getClient: jest.fn()
}));



// Mock file system operations
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  access: jest.fn()
}));

// Mock path operations
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  extname: jest.fn((filename) => {
    const ext = filename.split('.').pop();
    return ext ? `.${ext}` : '';
  })
}));

// Test cleanup
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Global teardown
afterAll(async () => {
  // Clean up any remaining resources
  if (global.testServer) {
    await global.testServer.close();
  }
});
