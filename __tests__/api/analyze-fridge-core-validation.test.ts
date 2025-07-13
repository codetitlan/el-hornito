/**
 * Core Test Suite for /api/analyze-fridge - File Validation
 * Focus: File size validation, file type validation, basic input validation
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

describe('/api/analyze-fridge - File Validation', () => {
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

  describe('File Size Validation', () => {
    test('handles oversized image file', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('large.jpg', 10000000, 'image/jpeg') // 10MB
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        {
          success: false,
          error: 'File size too large. Maximum size is 5MB.',
        },
        { status: 400 }
      );
    });

    test('accepts valid sized image file', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('medium.jpg', 3000000, 'image/jpeg') // 3MB
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Should proceed to API call (expect error due to mocking)
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to analyze fridge contents',
          processingTime: expect.any(Number),
        }),
        { status: 500 }
      );
    });
  });

  describe('File Type Validation', () => {
    test('handles invalid file type - PDF', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('document.pdf', 1000000, 'application/pdf')
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        {
          success: false,
          error:
            'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        },
        { status: 400 }
      );
    });

    test('handles invalid file type - text file', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('text.txt', 1000000, 'text/plain')
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        {
          success: false,
          error:
            'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        },
        { status: 400 }
      );
    });

    test('accepts valid JPEG file', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('photo.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Should proceed to API call (expect error due to mocking)
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to analyze fridge contents',
          processingTime: expect.any(Number),
        }),
        { status: 500 }
      );
    });

    test('accepts valid PNG file', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('photo.png', 1000000, 'image/png')
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Should proceed to API call (expect error due to mocking)
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to analyze fridge contents',
          processingTime: expect.any(Number),
        }),
        { status: 500 }
      );
    });

    test('accepts valid WebP file', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('photo.webp', 1000000, 'image/webp')
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Should proceed to API call (expect error due to mocking)
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to analyze fridge contents',
          processingTime: expect.any(Number),
        }),
        { status: 500 }
      );
    });
  });
});
