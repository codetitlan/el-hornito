/**
 * Debug prompts test to see what's failing
 */

import { NextRequest } from 'next/server';

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

describe('DEBUG: prompts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnthropicCreate.mockResolvedValue({
      content: [
        { type: 'text', text: JSON.stringify({ title: 'Test Recipe' }) },
      ],
    });
  });

  test('DEBUG: simple API call with console logs', async () => {
    const createMockFile = (name: string, size: number, type: string) => {
      const file = new File(['mock content'], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    const createMockRequestWithFormData = (formData: FormData) => {
      return {
        formData: () => Promise.resolve(formData),
        headers: {
          get: (name: string) => (name === 'accept-language' ? 'en' : null),
        },
      };
    };

    const formData = new FormData();
    formData.append('image', createMockFile('test.jpg', 1000000, 'image/jpeg'));
    formData.append('locale', 'en');
    formData.append('preferences', 'Quick meals');
    formData.append('dietaryRestrictions', '[]');
    formData.append('userSettings', '{}');

    const mockRequest = createMockRequestWithFormData(formData);
    const { POST } = await import('@/app/api/analyze-fridge/route');

    await POST(mockRequest as NextRequest);

    console.log(
      'mockAnthropicCreate call count:',
      mockAnthropicCreate.mock.calls.length
    );
    console.log('mockNextResponseJson calls:', mockNextResponseJson.mock.calls);

    if (mockAnthropicCreate.mock.calls.length === 0) {
      const call = mockNextResponseJson.mock.calls[0];
      const response = call[0];
      // Force failure to see the details
      throw new Error(
        `Anthropic not called. Response: ${JSON.stringify(response, null, 2)}`
      );
    }

    expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
  });
});
