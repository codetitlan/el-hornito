/**
 * Test Suite for /api/validate-api-key
 * Tests API key validation functionality and error handling
 */

import { NextRequest } from 'next/server';

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
  NextRequest: jest.fn(),
}));

// Helper to create mock NextRequest
const createMockNextRequest = (data: Record<string, unknown>) =>
  ({
    json: jest.fn().mockResolvedValue(data),
    cookies: new Map(),
    nextUrl: new URL('http://localhost:3000'),
    page: {},
    ua: '',
    // Add minimal NextRequest properties to satisfy type checking
  } as unknown as NextRequest);

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

      const mockRequest = createMockNextRequest({
        apiKey: 'valid-api-key-123',
      });

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest);
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

      const mockRequest = createMockNextRequest({ apiKey: 'invalid-key' });

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400); // API returns 400, not 401
      expect(result).toEqual({
        success: false,
        error: 'Invalid API key',
      });
    });

    test('returns 400 for missing API key', async () => {
      const mockRequest = createMockNextRequest({});

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest);
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

      const mockRequest = createMockNextRequest({ apiKey: 'test-key' });

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400); // API returns 400 for validation errors
      expect(result).toEqual({
        success: false,
        error: 'Failed to validate API key',
      });
    });

    test('handles empty API key', async () => {
      const mockRequest = createMockNextRequest({ apiKey: '' });

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        success: false,
        error: 'API key is required',
      });
    });

    test('handles request parsing errors (500)', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        cookies: new Map(),
        nextUrl: new URL('http://localhost:3000'),
        page: {},
        ua: '',
      } as unknown as NextRequest;

      const { POST } = await import('@/app/api/validate-api-key/route');
      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });
  });
});
