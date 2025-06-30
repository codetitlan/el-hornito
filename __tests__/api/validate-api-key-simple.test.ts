/**
 * Test Suite for /api/validate-api-key
 * Tests API key validation functionality and error handling
 */

// Mock Anthropic SDK
const MockAnthropic = jest.fn();
jest.mock('@anthropic-ai/sdk', () => MockAnthropic);

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

describe('/api/validate-api-key', () => {
  let mockAnthropicClient: {
    messages: {
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    mockAnthropicClient = {
      messages: {
        create: jest.fn(),
      },
    };
    MockAnthropic.mockImplementation(() => mockAnthropicClient);
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/validate-api-key', () => {
    test('validates correct API key successfully', async () => {
      // Mock successful Anthropic response
      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello!' }],
      });

      // Create a mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ apiKey: 'valid-api-key-123' }),
      };

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest as any);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ success: true });

      // Verify Anthropic client was created with the provided key
      expect(MockAnthropic).toHaveBeenCalledWith({
        apiKey: 'valid-api-key-123',
      });
    });

    test('rejects invalid API key', async () => {
      // Mock Anthropic API error (invalid key)
      mockAnthropicClient.messages.create.mockRejectedValue({
        status: 401,
        message: 'Invalid API key',
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ apiKey: 'invalid-key' }),
      };

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest as any);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result).toEqual({
        success: false,
        error: 'Invalid API key',
      });
    });

    test('returns 400 for missing API key', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      };

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        success: false,
        error: 'API key is required',
      });
    });

    test('handles network errors gracefully', async () => {
      mockAnthropicClient.messages.create.mockRejectedValue(
        new Error('Network error')
      );

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ apiKey: 'test-key' }),
      };

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest as any);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        success: false,
        error: 'Failed to validate API key',
      });
    });

    test('handles empty API key', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ apiKey: '' }),
      };

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest as any);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        success: false,
        error: 'API key is required',
      });
    });
  });
});
