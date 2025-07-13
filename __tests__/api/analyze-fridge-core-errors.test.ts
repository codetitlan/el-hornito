/**
 * Core Test Suite for /api/analyze-fridge - Error Handling
 * Focus: API key validation, user settings validation, authentication errors
 */

import { NextRequest } from 'next/server';
import {
  createMockRequestWithFormData,
  AnthropicMockManager,
  NextResponseMockManager,
} from '../helpers/api-test-utils';

// Import the SDK mock implementation
import { mockMessagesCreate } from '../__mocks__/@anthropic-ai/sdk';

// Use Jest's auto mocking
jest.mock('@anthropic-ai/sdk');

// Mock NextResponse with proper implementation
const mockNextResponseJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson,
  },
  NextRequest: jest.fn(),
}));

// Mock constants to provide valid environment
jest.mock('@/lib/constants', () => ({
  ENV: {
    NODE_ENV: 'test',
    ANTHROPIC_API_KEY: 'sk-ant-api-test-key-12345',
  },
  APP_CONFIG: {
    MAX_FILE_SIZE: 5000000, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ERROR_MESSAGES: {
      FILE_TOO_LARGE: 'File size too large. Maximum size is 5MB.',
      INVALID_FILE_TYPE:
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      API_ERROR: 'Failed to analyze fridge contents',
      PARSE_ERROR: 'Failed to parse AI response',
      REQUEST_ERROR: 'Failed to process request',
    },
  },
}));

// Test utilities and mock managers
let anthropicMockManager: AnthropicMockManager;
let responseMockManager: NextResponseMockManager;

// Helper to create mock File
const createMockFile = (
  name: string,
  size: number,
  type: string,
  content = 'mock content'
) => {
  const file = new File([content], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('/api/analyze-fridge - Error Handling', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Initialize mock managers
    anthropicMockManager = new AnthropicMockManager(mockMessagesCreate);
    responseMockManager = new NextResponseMockManager(mockNextResponseJson);

    // Setup standard mock behavior
    responseMockManager.setupStandardBehavior();
    anthropicMockManager.mockSuccessfulRecipe('en');
  });

  describe('API Key Validation', () => {
    test('handles missing API key environment variable', async () => {
      // Mock constants without API key
      jest.doMock('@/lib/constants', () => ({
        ENV: {
          NODE_ENV: 'test',
          ANTHROPIC_API_KEY: undefined,
        },
        APP_CONFIG: {
          MAX_FILE_SIZE: 5000000,
          ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
          ERROR_MESSAGES: {
            FILE_TOO_LARGE: 'File size too large. Maximum size is 5MB.',
            INVALID_FILE_TYPE:
              'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
            API_ERROR: 'Failed to analyze fridge contents',
            PARSE_ERROR: 'Failed to parse AI response',
            REQUEST_ERROR: 'Failed to process request',
          },
        },
      }));

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);

      // Re-import to get the module with mocked constants
      jest.resetModules();
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        {
          success: false,
          error: 'Authentication failed. Please configure a valid API key.',
          processingTime: expect.any(Number),
        },
        { status: 401 }
      );
    });
  });

  describe('User Settings Validation Errors', () => {
    test('should handle malformed user settings JSON', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');
      formData.append('userSettings', 'invalid-json{malformed'); // Malformed JSON

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('settings'),
        }),
        { status: 400 }
      );
    });

    test('should handle invalid user settings structure', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');
      formData.append(
        'userSettings',
        JSON.stringify({
          invalidField: 'invalid', // Invalid structure
        })
      );

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        }),
        { status: 401 }
      );
    });
  });

  describe('Authentication Error Handling', () => {
    test('should handle auth errors with personal API key', async () => {
      // Mock auth error
      anthropicMockManager.mockAuthError();

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');
      formData.append('apiKey', 'sk-ant-api03-invalid-personal-key-12345');
      formData.append(
        'userSettings',
        JSON.stringify({
          difficulty: 'easy',
          dietaryRestrictions: [],
        })
      );

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          processingTime: expect.any(Number),
        }),
        { status: 500 }
      );
    });

    test('should handle auth errors without personal API key', async () => {
      // Mock auth error
      anthropicMockManager.mockAuthError();

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');
      // No apiKey provided - will use system key
      formData.append(
        'userSettings',
        JSON.stringify({
          difficulty: 'easy',
          dietaryRestrictions: [],
        })
      );

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Authentication failed'),
          processingTime: expect.any(Number),
        }),
        { status: 401 }
      );
    });
  });

  describe('General Error Handling', () => {
    test('should handle non-auth errors with proper error response', async () => {
      // Mock a general error (not auth-related)
      anthropicMockManager.mockRateLimitError();

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');
      formData.append(
        'userSettings',
        JSON.stringify({
          difficulty: 'easy',
          dietaryRestrictions: [],
        })
      );

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          processingTime: expect.any(Number),
        }),
        { status: expect.any(Number) }
      );
    });
  });
});
