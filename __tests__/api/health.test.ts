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
  });
});
