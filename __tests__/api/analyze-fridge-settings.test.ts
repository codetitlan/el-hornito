/**
 * User Settings Test Suite for /api/analyze-fridge
 * Focus: User settings variations, dietary restrictions, preferences
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

describe('/api/analyze-fridge - User Settings and Preferences', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Initialize mock managers
    anthropicMockManager = new AnthropicMockManager(mockAnthropicCreate);
    responseMockManager = new NextResponseMockManager(mockNextResponseJson);

    // Setup standard mock behavior
    responseMockManager.setupStandardBehavior();
    anthropicMockManager.mockSuccessfulRecipe('en');
  });

  describe('User Settings Processing', () => {
    test('handles comprehensive user settings', async () => {
      const userSettings = {
        cookingPreferences: {
          cuisineTypes: ['italian', 'mexican'],
          spiceLevel: 'medium',
          cookingTime: 'under-30-minutes',
        },
        dietaryRestrictions: ['vegetarian', 'gluten-free'],
        servingSize: 4,
      };

      const formData = new FormData();
      formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
      formData.append('locale', 'en');
      formData.append('userSettings', JSON.stringify(userSettings));

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockAnthropicCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([
                expect.objectContaining({
                  text: expect.stringContaining("italian") })])],
                }),
              ]),
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

    test('handles empty and partial settings', async () => {
      const testCases = [
        { userSettings: {}, name: 'empty settings' },
        { userSettings: { servingSize: 2 }, name: 'partial settings' },
      ];

      for (const testCase of testCases) {
        const formData = new FormData();
        formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
        formData.append('locale', 'en');
        formData.append('userSettings', JSON.stringify(testCase.userSettings));

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        expect(mockAnthropicCreate).toHaveBeenCalled();
        expect(mockNextResponseJson).toHaveBeenCalledWith({
          success: true,
          recipe: expect.any(Object),
          processingTime: expect.any(Number),
        });

        jest.clearAllMocks();
        anthropicMockManager.mockSuccessfulRecipe('en');
        responseMockManager.setupStandardBehavior();
      }
    });

    test('handles malformed user settings JSON', async () => {
      const formData = new FormData();
      formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
      formData.append('locale', 'en');
      formData.append('userSettings', 'invalid-json{');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { success: false, error: 'Invalid user settings format' },
        { status: 400 }
      );
    });
  });

  describe('Dietary Restrictions', () => {
    test('handles dietary restrictions processing', async () => {
      const testCases = [
        { restrictions: ['vegetarian', 'gluten-free'], expectedContent: 'vegetarian' },
        { restrictions: [], expectedContent: null },
        { restrictions: ['vegan', 'nut-free', 'keto-friendly'], expectedContent: 'vegan' },
      ];

      for (const testCase of testCases) {
        const formData = new FormData();
        formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
        formData.append('locale', 'en');
        formData.append('dietaryRestrictions', JSON.stringify(testCase.restrictions));

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        if (testCase.expectedContent) {
          expect(mockAnthropicCreate).toHaveBeenCalledWith(
            expect.objectContaining({
              messages: expect.arrayContaining([
                expect.objectContaining({
                  content: expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining(testCase.expectedContent),
                }),
              ]),
            })
          );
        }

        expect(mockNextResponseJson).toHaveBeenCalledWith({
          success: true,
          recipe: expect.any(Object),
          processingTime: expect.any(Number),
        });

        jest.clearAllMocks();
        anthropicMockManager.mockSuccessfulRecipe('en');
        responseMockManager.setupStandardBehavior();
      }
    });

    test('handles malformed dietary restrictions JSON', async () => {
      const formData = new FormData();
      formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
      formData.append('locale', 'en');
      formData.append('dietaryRestrictions', 'not-valid-json[');

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { success: false, error: 'Invalid dietary restrictions format' },
        { status: 400 }
      );
    });
  });

  describe('Combined Preferences and Settings', () => {
    test('handles combined preferences, restrictions, and settings', async () => {
      const formData = new FormData();
      formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
      formData.append('locale', 'en');
      formData.append('preferences', 'Quick healthy meals under 30 minutes');
      formData.append('dietaryRestrictions', JSON.stringify(['vegetarian']));
      formData.append(
        'userSettings',
        JSON.stringify({
          cookingPreferences: { cuisineTypes: ['mediterranean'], spiceLevel: 'mild' },
        })
      );

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      const call = mockAnthropicCreate.mock.calls[0][0];
      const prompt = call.messages[0].content;
      
      expect(prompt).toContain('Quick healthy meals');
      expect(prompt).toContain('vegetarian');
      expect(prompt).toContain('mediterranean');

      expect(mockNextResponseJson).toHaveBeenCalledWith({
        success: true,
        recipe: expect.any(Object),
        processingTime: expect.any(Number),
      });
    });

    test('handles special characters in preferences', async () => {
      const formData = new FormData();
      formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
      formData.append('locale', 'en');
      formData.append('preferences', 'Spicy 🌶️ meals with "exotic" ingredients!');

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
