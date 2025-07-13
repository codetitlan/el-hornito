/**
 * Test Suite for /api/health
 * Tests health check functionality and response format
 */

// Mock the constants module to avoid import issues during testing
jest.mock('@/lib/constants', () => ({
  ENV: {
    NODE_ENV: 'test',
    ANTHROPIC_API_KEY: 'test-api-key',
  },
}));

// Mock NextResponse to avoid Next.js runtime dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ok: options?.status === undefined || options.status < 400,
    })),
  },
}));

describe('/api/health', () => {
  beforeEach(() => {
    // Set up environment variables for testing
    Object.assign(process.env, {
      PORT: '3000',
      HOSTNAME: 'localhost',
      NODE_ENV: 'test',
    });

    // Clear all module caches to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    test('should return health check response structure', async () => {
      // Dynamically import the GET handler to avoid module loading issues
      const { GET } = await import('@/app/api/health/route');

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          environment: 'test',
          apiKeyMode: expect.any(String),
          port: expect.any(String),
          hostname: expect.any(String),
          nodeEnv: expect.any(String),
          services: expect.objectContaining({
            api: 'operational',
            settings: 'operational',
          }),
        })
      );
    });

    test('timestamp is valid ISO string', async () => {
      const { GET } = await import('@/app/api/health/route');
      const response = await GET();
      const result = await response.json();

      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );

      // Verify it's a valid date
      const date = new Date(result.timestamp);
      expect(date.toISOString()).toBe(result.timestamp);
    });

    test('includes correct environment information', async () => {
      const { GET } = await import('@/app/api/health/route');
      const response = await GET();
      const result = await response.json();

      expect(result.environment).toBe('test');
      expect(result.nodeEnv).toBe('test');
      expect(result.port).toBe('3000');
      expect(result.hostname).toBe('localhost');
    });

    test('services are marked as operational', async () => {
      const { GET } = await import('@/app/api/health/route');
      const response = await GET();
      const result = await response.json();

      expect(result.services).toEqual({
        api: 'operational',
        settings: 'operational',
      });
    });

    test('response time is reasonable', async () => {
      const { GET } = await import('@/app/api/health/route');
      const startTime = Date.now();
      const response = await GET();
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      expect(response.status).toBe(200);
    });

    test('returns apiKeyMode "shared" when ANTHROPIC_API_KEY is present', async () => {
      const { GET } = await import('@/app/api/health/route');
      const response = await GET();
      const result = await response.json();

      expect(result.apiKeyMode).toBe('shared');
    });

    test('returns apiKeyMode "personal-only" when ANTHROPIC_API_KEY is not present', async () => {
      // Mock the constants module to return no API key
      jest.doMock('@/lib/constants', () => ({
        ENV: {
          NODE_ENV: 'test',
          ANTHROPIC_API_KEY: null,
        },
      }));

      // Clear module cache and re-import
      jest.resetModules();
      const { GET } = await import('@/app/api/health/route');

      const response = await GET();
      const result = await response.json();

      expect(result.apiKeyMode).toBe('personal-only');

      // Restore the original mock
      jest.doMock('@/lib/constants', () => ({
        ENV: {
          NODE_ENV: 'test',
          ANTHROPIC_API_KEY: 'test-api-key',
        },
      }));
    });

    test('uses default port and hostname when environment variables are not set', async () => {
      // Remove PORT and HOSTNAME from environment
      const originalPort = process.env.PORT;
      const originalHostname = process.env.HOSTNAME;
      delete process.env.PORT;
      delete process.env.HOSTNAME;

      jest.resetModules();
      const { GET } = await import('@/app/api/health/route');

      const response = await GET();
      const result = await response.json();

      expect(result.port).toBe('3000');
      expect(result.hostname).toBe('localhost');

      // Restore environment variables
      if (originalPort) process.env.PORT = originalPort;
      if (originalHostname) process.env.HOSTNAME = originalHostname;
    });

    test('handles errors gracefully and returns 503 status', async () => {
      // Use a simpler approach - spy on console.error to trigger the catch block
      // by causing an error during object construction
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock ENV to cause an error when accessing properties
      jest.doMock('@/lib/constants', () => ({
        get ENV() {
          throw new Error('Mock error for testing');
        },
      }));

      jest.resetModules();
      const { GET } = await import('@/app/api/health/route');

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result).toEqual({
        status: 'unhealthy',
        timestamp: expect.any(String),
        error: 'Mock error for testing',
      });

      consoleSpy.mockRestore();

      // Restore the original mock
      jest.doMock('@/lib/constants', () => ({
        ENV: {
          NODE_ENV: 'test',
          ANTHROPIC_API_KEY: 'test-api-key',
        },
      }));
    });

    test('handles non-Error objects in catch block', async () => {
      // Mock ENV to throw a non-Error object
      jest.doMock('@/lib/constants', () => ({
        get ENV() {
          throw 'String error'; // Non-Error object
        },
      }));

      jest.resetModules();
      const { GET } = await import('@/app/api/health/route');

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result).toEqual({
        status: 'unhealthy',
        timestamp: expect.any(String),
        error: 'Unknown error',
      });

      // Restore the original mock
      jest.doMock('@/lib/constants', () => ({
        ENV: {
          NODE_ENV: 'test',
          ANTHROPIC_API_KEY: 'test-api-key',
        },
      }));
    });

    test('includes all required fields in healthy response', async () => {
      const { GET } = await import('@/app/api/health/route');
      const response = await GET();
      const result = await response.json();

      // Verify all required fields are present
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('apiKeyMode');
      expect(result).toHaveProperty('port');
      expect(result).toHaveProperty('hostname');
      expect(result).toHaveProperty('nodeEnv');
      expect(result).toHaveProperty('services');
      expect(result.services).toHaveProperty('api');
      expect(result.services).toHaveProperty('settings');
    });

    test('returns consistent environment values', async () => {
      const { GET } = await import('@/app/api/health/route');
      const response = await GET();
      const result = await response.json();

      // Environment and nodeEnv should match
      expect(result.environment).toBe(result.nodeEnv);
      expect(result.environment).toBe('test');
    });
  });
});
