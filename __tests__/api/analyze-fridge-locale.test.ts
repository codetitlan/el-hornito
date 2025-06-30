/**
 * Locale and Language Test Suite for /api/analyze-fridge
 * Focus: Locale handling, language-specific responses, internationalization
 */

import { NextRequest } from 'next/server';
import {
  createMockRequestWithFormData,
  AnthropicMockManager,
  NextResponseMockManager,
} from '../helpers/api-test-utils';

// Mock Anthropic SDK at the top
const mockAnthropicCreate = jest.fn();
const MockAnthropic = jest.fn().mockImplementation(() => ({
  messages: {
    create: mockAnthropicCreate,
  },
}));

jest.mock('@anthropic-ai/sdk', () => MockAnthropic);

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
    MAX_FILE_SIZE: 5000000,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ERROR_MESSAGES: {
      FILE_TOO_LARGE: 'File size too large. Maximum size is 5MB.',
      INVALID_FILE_TYPE: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
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

describe('/api/analyze-fridge - Locale and Language Testing', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Initialize mock managers
    anthropicMockManager = new AnthropicMockManager(mockAnthropicCreate);
    responseMockManager = new NextResponseMockManager(mockNextResponseJson);

    // Setup standard mock behavior
    responseMockManager.setupStandardBehavior();
  });

  describe('English Locale Processing', () => {
    test('handles English locale correctly', async () => {
      anthropicMockManager.mockSuccessfulRecipe('en');

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Verify Anthropic was called with English prompt
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('Please analyze this refrigerator image'),
            }),
          ]),
        })
      );

      expect(mockNextResponseJson).toHaveBeenCalledWith({
        success: true,
        recipe: expect.any(Object),
        processingTime: expect.any(Number),
      });
    });

    test('defaults to English when no locale specified', async () => {
      anthropicMockManager.mockSuccessfulRecipe('en');

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      // No locale appended - should default to English

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Should use English prompt by default
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('Please analyze this refrigerator image'),
            }),
          ]),
        })
      );

      expect(mockNextResponseJson).toHaveBeenCalledWith({
        success: true,
        recipe: expect.any(Object),
        processingTime: expect.any(Number),
      });
    });
  });

  describe('Spanish Locale Processing', () => {
    test('handles Spanish locale correctly', async () => {
      anthropicMockManager.mockSuccessfulRecipe('es');

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'es');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Verify Anthropic was called with Spanish prompt
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('Por favor analiza esta imagen del refrigerador'),
            }),
          ]),
        })
      );

      expect(mockNextResponseJson).toHaveBeenCalledWith({
        success: true,
        recipe: expect.any(Object),
        processingTime: expect.any(Number),
      });
    });

    test('handles Spanish with user preferences', async () => {
      anthropicMockManager.mockSuccessfulRecipe('es');

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'es');
      formData.append('preferences', 'Comidas rápidas y fáciles');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Verify preferences are included in Spanish prompt
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('Comidas rápidas y fáciles'),
            }),
          ]),
        })
      );

      expect(mockNextResponseJson).toHaveBeenCalledWith({
        success: true,
        recipe: expect.any(Object),
        processingTime: expect.any(Number),
      });
    });
  });

  describe('Unsupported Locale Handling', () => {
    test('handles unsupported locale gracefully', async () => {
      anthropicMockManager.mockSuccessfulRecipe('en'); // Should fallback to English

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'fr'); // French - not supported

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Should fallback to English prompt
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('Please analyze this refrigerator image'),
            }),
          ]),
        })
      );

      expect(mockNextResponseJson).toHaveBeenCalledWith({
        success: true,
        recipe: expect.any(Object),
        processingTime: expect.any(Number),
      });
    });

    test('handles invalid locale format', async () => {
      anthropicMockManager.mockSuccessfulRecipe('en');

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'invalid-locale-format');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      // Should fallback to English prompt
      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('Please analyze this refrigerator image'),
            }),
          ]),
        })
      );
    });
  });

  describe('Locale with Complex Scenarios', () => {
    test('handles locale with special characters', async () => {
      anthropicMockManager.mockSuccessfulRecipe('en');

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en-US');
      formData.append('preferences', 'Quick & easy meals with "special" ingredients');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
      expect(mockNextResponseJson).toHaveBeenCalledWith({
        success: true,
        recipe: expect.any(Object),
        processingTime: expect.any(Number),
      });
    });
  });
});
