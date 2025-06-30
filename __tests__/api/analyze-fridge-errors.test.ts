/**
 * Error Scenarios Test Suite for /api/analyze-fridge
 * Focus: Error handling, edge cases, file validation, API failures
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
      INVALID_FILE_TYPE:
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
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

describe('/api/analyze-fridge - Error Scenarios and Edge Cases', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Initialize mock managers
    anthropicMockManager = new AnthropicMockManager(mockAnthropicCreate);
    responseMockManager = new NextResponseMockManager(mockNextResponseJson);

    // Setup standard mock behavior
    responseMockManager.setupStandardBehavior();
  });

  describe('Anthropic API Error Scenarios', () => {
    test('handles various Anthropic API errors', async () => {
      const errorCases = [
        'Anthropic API rate limit exceeded',
        'Request timeout',
        'Network unreachable',
        'Quota exceeded. Please try again later.',
      ];

      for (const errorMessage of errorCases) {
        jest.clearAllMocks();
        mockAnthropicCreate.mockRejectedValueOnce(new Error(errorMessage));

        const formData = new FormData();
        formData.append(
          'image',
          createMockFile('test.jpg', 1000000, 'image/jpeg')
        );
        formData.append('locale', 'en');

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { success: false, error: 'Failed to analyze fridge contents' },
          { status: 500 }
        );
      }
    });

    test('handles malformed and empty AI responses', async () => {
      const responseCases = [
        {
          content: [{ type: 'text', text: 'Invalid JSON {broken}' }],
          name: 'malformed JSON',
        },
        { content: [], name: 'empty response' },
      ];

      for (const testCase of responseCases) {
        jest.clearAllMocks();
        mockAnthropicCreate.mockResolvedValueOnce(testCase.content);

        const formData = new FormData();
        formData.append(
          'image',
          createMockFile('test.jpg', 1000000, 'image/jpeg')
        );
        formData.append('locale', 'en');

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        expect(mockNextResponseJson).toHaveBeenCalledWith(
          { success: false, error: 'Failed to parse AI response' },
          { status: 500 }
        );
      }
    });
  });

  describe('File Validation Edge Cases', () => {
    test('handles various file edge cases', async () => {
      const testCases = [
        {
          file: createMockFile('imagefile', 1000000, 'image/jpeg'),
          expectSuccess: true,
          name: 'file with no extension',
        },
        {
          file: createMockFile('image.txt', 1000000, 'image/png'),
          expectSuccess: true,
          name: 'misleading extension but correct MIME',
        },
        {
          file: createMockFile('test.jpg', 1000000, 'IMAGE/JPEG'),
          expectSuccess: false,
          expectedError:
            'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
          name: 'uppercase MIME type',
        },
        {
          file: createMockFile('empty.jpg', 0, 'image/jpeg'),
          expectSuccess: true,
          name: 'zero-byte file',
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        if (testCase.expectSuccess) {
          anthropicMockManager.mockSuccessfulRecipe('en');
        }

        const formData = new FormData();
        formData.append('image', testCase.file);
        formData.append('locale', 'en');

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        if (testCase.expectSuccess) {
          expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
        } else {
          expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: false, error: testCase.expectedError },
            { status: 400 }
          );
        }
      }
    });
  });

  describe('Request Processing Edge Cases', () => {
    test('handles corrupted FormData and large input', async () => {
      // Test corrupted FormData
      const mockRequest = {
        method: 'POST',
        formData: () => Promise.reject(new Error('Corrupted form data')),
      };

      const { POST } = await import('@/app/api/analyze-fridge/route');
      await POST(mockRequest as unknown as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { success: false, error: 'Failed to process request' },
        { status: 500 }
      );

      // Test extremely large preference text
      jest.clearAllMocks();
      const veryLongPreferences = 'A'.repeat(10000);

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');
      formData.append('preferences', veryLongPreferences);

      anthropicMockManager.mockSuccessfulRecipe('en');
      const validRequest = createMockRequestWithFormData(formData);

      await POST(validRequest as NextRequest);
      expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
    });
  });
});
