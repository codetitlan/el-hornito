/**
 * Enhanced Test Suite for /api/validate-api-key
 * Master-level API key validation testing
 */

import { NextRequest } from 'next/server';
import {
  createMockRequestWithJSON,
  AnthropicMockManager,
  NextResponseMockManager,
  MockValidationUtils,
} from '../helpers/api-test-utils';

// Mock Anthropic SDK
const mockAnthropicCreate = jest.fn();
const MockAnthropic = jest.fn().mockImplementation(() => ({
  messages: {
    create: mockAnthropicCreate,
  },
}));
jest.mock('@anthropic-ai/sdk', () => MockAnthropic);

// Mock NextResponse to avoid Next.js runtime dependencies
const mockNextResponseJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
  NextRequest: jest.fn(),
}));

// Test utilities and mock managers
let anthropicMockManager: AnthropicMockManager;
let responseMockManager: NextResponseMockManager;

describe('/api/validate-api-key', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mock managers
    anthropicMockManager = new AnthropicMockManager(mockAnthropicCreate);
    responseMockManager = new NextResponseMockManager(mockNextResponseJson);

    // Setup standard behavior
    responseMockManager.setupStandardBehavior();
    MockAnthropic.mockImplementation(() => ({
      messages: { create: mockAnthropicCreate },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/validate-api-key', () => {
    test('validates correct API key successfully', async () => {
      // Mock successful Anthropic response
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello!' }],
      });

      const mockRequest = createMockRequestWithJSON({
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
      mockAnthropicCreate.mockRejectedValue({
        status: 401,
        message: 'Invalid API key',
      });

      const mockRequest = createMockRequestWithJSON({ apiKey: 'invalid-key' });

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
      const mockRequest = createMockRequestWithJSON({});

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
      mockAnthropicCreate.mockRejectedValue(new Error('Network error'));

      const mockRequest = createMockRequestWithJSON({ apiKey: 'test-key' });

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
      const mockRequest = createMockRequestWithJSON({ apiKey: '' });

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
