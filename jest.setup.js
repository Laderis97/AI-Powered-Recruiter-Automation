// Jest setup file

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '1000';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
