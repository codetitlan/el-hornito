/**
 * Environment-based API selection tests for /lib/api.ts
 * Covers environment logic and API selection scenarios
 */

describe('/lib/api.ts - Environment-Based API Selection', () => {
  // Mock localStorage for browser environment
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeAll(() => {
    // Mock window.localStorage if not already defined
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
    } else {
      Object.defineProperty(global, 'window', {
        value: { localStorage: mockLocalStorage },
        writable: true,
      });
    }

    global.fetch = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Environment-Based API Selection Logic (Lines 254-258)', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalApiKey = process.env.ANTHROPIC_API_KEY;

    afterEach(() => {
      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
      });
      if (originalApiKey) {
        process.env.ANTHROPIC_API_KEY = originalApiKey;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
    });

    test('uses real API in production environment', async () => {
      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });
      process.env.ANTHROPIC_API_KEY = 'test-env-key';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Force re-import to trigger the environment detection logic
      await import('@/lib/api');

      // Verify real API selection was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '🚀 Using real API - Environment key: Available'
      );

      consoleSpy.mockRestore();
    });

    test('uses real API in development with environment API key', async () => {
      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });
      process.env.ANTHROPIC_API_KEY = 'test-dev-env-key';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Force re-import to trigger the environment detection logic
      await import('@/lib/api');

      // Verify real API selection was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '🚀 Using real API - Environment key: Available'
      );

      consoleSpy.mockRestore();
    });

    test('uses mock API in development without environment API key', async () => {
      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });
      delete process.env.ANTHROPIC_API_KEY;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Force re-import to trigger the environment detection logic
      await import('@/lib/api');

      // Verify mock API selection was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔧 Using mock API in development mode - no ANTHROPIC_API_KEY found'
      );

      consoleSpy.mockRestore();
    });

    test('uses real API in production without environment API key (personal key fallback)', async () => {
      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });
      delete process.env.ANTHROPIC_API_KEY;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Force re-import to trigger the environment detection logic
      await import('@/lib/api');

      // Verify real API selection was logged with environment key not available
      expect(consoleSpy).toHaveBeenCalledWith(
        '🚀 Using real API - Environment key: Not available'
      );

      consoleSpy.mockRestore();
    });

    test('uses real API in test environment (covers all non-development paths)', async () => {
      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        writable: true,
      });
      delete process.env.ANTHROPIC_API_KEY;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Force re-import to trigger the environment detection logic
      await import('@/lib/api');

      // Verify real API selection was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '🚀 Using real API - Environment key: Not available'
      );

      consoleSpy.mockRestore();
    });
  });
});
