/**
 * API Test Setup
 * Configures the testing environment for API endpoint testing
 */

import { TextEncoder, TextDecoder } from 'util';

// Global polyfills for Node.js test environment
// Only assign if not already available (avoid redeclaration)
if (typeof global.TextEncoder === 'undefined') {
  Object.assign(global, { TextEncoder, TextDecoder });
}

// Mock Next.js request/response objects
Object.assign(global, {
  Request: class MockRequest {},
  Response: class MockResponse {},
});

// Mock environment variables for testing
Object.assign(process.env, {
  NODE_ENV: 'test',
  ANTHROPIC_API_KEY: 'test-api-key',
});

// Mock console methods to reduce noise during testing
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset console mocks before each test
  jest.clearAllMocks();

  // Only mock console in tests that explicitly need it
  console.error = jest.fn();
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

// Global test timeout (30 seconds for API tests)
jest.setTimeout(30000);
