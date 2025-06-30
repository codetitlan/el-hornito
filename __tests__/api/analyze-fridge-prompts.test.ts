/**
 * Prompt Generation Test Suite for /api/analyze-fridge
 * Focus: Prompt generation, AI integration, response processing
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

describe('/api/analyze-fridge - Prompt Generation and AI Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Initialize mock managers
    anthropicMockManager = new AnthropicMockManager(mockAnthropicCreate);
    responseMockManager = new NextResponseMockManager(mockNextResponseJson);

    // Setup standard mock behavior
    responseMockManager.setupStandardBehavior();
  });

  describe('Prompt Generation and Structure', () => {
    test('generates proper prompt structure for different locales', async () => {
      const testCases = [
        {
          locale: 'en',
          expectedText: 'Please analyze this refrigerator image',
          preferences: 'Quick healthy meals',
        },
        {
          locale: 'es',
          expectedText: 'Por favor analiza esta imagen del refrigerador',
          preferences: 'Comidas rápidas y saludables',
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        anthropicMockManager.mockSuccessfulRecipe(
          testCase.locale as 'en' | 'es'
        );

        const formData = new FormData();
        formData.append(
          'image',
          createMockFile('test.jpg', 1000000, 'image/jpeg')
        );
        formData.append('locale', testCase.locale);
        formData.append('preferences', testCase.preferences);

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        const anthropicCall = mockAnthropicCreate.mock.calls[0][0];
        expect(anthropicCall).toEqual(
          expect.objectContaining({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4000,
            temperature: 0.7,
            messages: expect.arrayContaining([
              expect.objectContaining({
                role: 'user',
                content: expect.arrayContaining([
                  expect.objectContaining({
                    type: 'text',
                    text: expect.stringContaining(testCase.expectedText),
                  }),
                  expect.objectContaining({
                    type: 'image',
                    source: expect.objectContaining({
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: expect.any(String),
                    }),
                  }),
                ]),
              }),
            ]),
          })
        );

        const prompt = anthropicCall.messages[0].content[0].text;
        expect(prompt).toContain(testCase.preferences);
      }
    });

    test('includes comprehensive user data in prompt', async () => {
      anthropicMockManager.mockSuccessfulRecipe('en');

      const userSettings = {
        cookingPreferences: { cuisineTypes: ['italian'], spiceLevel: 'medium' },
        allergies: ['nuts'],
        equipment: ['oven'],
      };

      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');
      formData.append('preferences', 'Healthy family meals');
      formData.append('dietaryRestrictions', JSON.stringify(['vegetarian']));
      formData.append('userSettings', JSON.stringify(userSettings));

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest as NextRequest);

      const anthropicCall = mockAnthropicCreate.mock.calls[0][0];
      const prompt = anthropicCall.messages[0].content[0].text;

      expect(prompt).toContain('Healthy family meals');
      expect(prompt).toContain('vegetarian');
      expect(prompt).toContain('italian');
      expect(prompt).toContain('nuts');
      expect(prompt).toContain('oven');
    });

    test('handles minimal input gracefully', async () => {
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

      const anthropicCall = mockAnthropicCreate.mock.calls[0][0];
      const prompt = anthropicCall.messages[0].content[0].text;

      expect(prompt).toContain('Please analyze this refrigerator image');
      expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('AI Response Processing and Image Handling', () => {
    test('processes various AI response formats', async () => {
      const testCases = [
        {
          name: 'clean JSON response',
          response: {
            recipes: [{ name: 'Test Recipe', ingredients: ['ingredient1'] }],
          },
          wrapInText: false,
        },
        {
          name: 'JSON with surrounding text',
          response: {
            recipes: [{ name: 'Pasta Recipe', ingredients: ['pasta'] }],
          },
          wrapInText: true,
        },
        {
          name: 'empty recipes array',
          response: { recipes: [] },
          wrapInText: false,
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();

        const responseText = testCase.wrapInText
          ? `Here are suggestions:\n${JSON.stringify(
              testCase.response
            )}\nHope this helps!`
          : JSON.stringify(testCase.response);

        mockAnthropicCreate.mockResolvedValueOnce({
          content: [{ type: 'text', text: responseText }],
        });

        const formData = new FormData();
        formData.append(
          'image',
          createMockFile('test.jpg', 1000000, 'image/jpeg')
        );
        formData.append('locale', 'en');

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        expect(mockNextResponseJson).toHaveBeenCalledWith({
          success: true,
          recipes: testCase.response.recipes,
          processingTime: expect.any(Number),
        });
      }
    });

    test('processes different image types correctly', async () => {
      anthropicMockManager.mockSuccessfulRecipe('en');

      const imageTypes = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.webp', type: 'image/webp' },
      ];

      for (const imageType of imageTypes) {
        jest.clearAllMocks();
        anthropicMockManager.mockSuccessfulRecipe('en');

        const formData = new FormData();
        formData.append(
          'image',
          createMockFile(imageType.name, 1000000, imageType.type)
        );
        formData.append('locale', 'en');

        const mockRequest = createMockRequestWithFormData(formData);
        const { POST } = await import('@/app/api/analyze-fridge/route');

        await POST(mockRequest as NextRequest);

        const anthropicCall = mockAnthropicCreate.mock.calls[0][0];
        const imageContent = anthropicCall.messages[0].content[1];

        expect(imageContent).toEqual(
          expect.objectContaining({
            type: 'image',
            source: expect.objectContaining({
              type: 'base64',
              media_type: imageType.type,
              data: expect.any(String),
            }),
          })
        );
      }
    });
  });
});
