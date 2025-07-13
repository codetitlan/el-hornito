import '@testing-library/jest-dom';

// Mock Next.js server environment for API route testing
// This sets up the necessary globals that Next.js API routes expect
Object.defineProperty(global, 'Request', {
  value: class MockRequest {
    constructor(public url: string, public options?: RequestInit) {}
    json() {
      return Promise.resolve({});
    }
    text() {
      return Promise.resolve('');
    }
    formData() {
      return Promise.resolve(new FormData());
    }
    headers = new Headers();
    method = 'GET';
  },
  writable: true,
});

Object.defineProperty(global, 'Response', {
  value: class MockResponse {
    constructor(public body?: unknown, public init?: ResponseInit) {}
    json() {
      return Promise.resolve(this.body);
    }
    text() {
      return Promise.resolve(String(this.body || ''));
    }
    ok = true;
    status = 200;
    statusText = 'OK';
    headers = new Headers();
  },
  writable: true,
});

// Global setup for all tests
Object.assign(process.env, {
  NODE_ENV: 'test',
  // Do NOT set ANTHROPIC_API_KEY - this forces tests to use our mock
});

// Mock console methods to reduce noise during testing
// const originalConsole = {
//   error: console.error,
//   log: console.log,
//   warn: console.warn,
// };

// beforeEach(() => {
//   // Reset console mocks before each test
//   jest.clearAllMocks();

//   // Only mock console in tests that explicitly need it
//   console.error = jest.fn();
//   console.log = jest.fn();
//   console.warn = jest.fn();
// });

// afterEach(() => {
//   // Restore original console methods
//   console.error = originalConsole.error;
//   console.log = originalConsole.log;
//   console.warn = originalConsole.warn;
// });

// Global test timeout (30 seconds for API tests)
jest.setTimeout(30000);
