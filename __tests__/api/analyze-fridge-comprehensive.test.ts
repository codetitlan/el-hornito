/**
 * Comprehensive Test Suite for /api/analyze-fridge
 * Tests business logic, error handling, and edge cases
 */

import { NextRequest } from 'next/server';

// Mock Anthropic SDK
const MockAnthropic = jest.fn();
jest.mock('@anthropic-ai/sdk', () => MockAnthropic);

// Mock NextResponse
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

// Mock constants to provide valid API key
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
    },
  },
}));

// Helper to create mock NextRequest with FormData
const createMockRequestWithFormData = (formData: FormData) =>
  ({
    formData: jest.fn().mockResolvedValue(formData),
    cookies: new Map(),
    nextUrl: new URL('http://localhost:3000'),
    page: {},
    ua: '',
  } as unknown as NextRequest);

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

describe('/api/analyze-fridge - Comprehensive Tests', () => {
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

  describe('File Validation', () => {
    test('accepts valid JPEG image', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );

      // Mock successful AI response
      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: 'Test Recipe',
              description: 'A test recipe',
              cookingTime: '15 minutes',
              difficulty: 'Easy',
              servings: 2,
              ingredients: ['Test ingredient'],
              instructions: ['Test instruction'],
            }),
          },
        ],
      });

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      expect(response.status).toBe(200);
    });

    test('rejects oversized files', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('huge.jpg', 10000000, 'image/jpeg')
      ); // 10MB

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('File size too large');
    });

    test('rejects invalid file types', async () => {
      const formData = new FormData();
      formData.append('image', createMockFile('test.txt', 1000, 'text/plain'));

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid file type');
    });

    test('requires image file', async () => {
      const formData = new FormData();
      // No image attached

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('No image file provided');
    });
  });

  describe('AI Processing', () => {
    test('handles valid AI response', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );

      const mockAIResponse = {
        title: 'Delicious Test Recipe',
        description: 'A wonderful test recipe',
        cookingTime: '30 minutes',
        difficulty: 'Medium',
        servings: 4,
        ingredients: ['Ingredient 1', 'Ingredient 2'],
        instructions: ['Step 1', 'Step 2'],
        tips: ['Tip 1'],
      };

      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockAIResponse) }],
      });

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockAIResponse);
    });

    test('handles malformed AI response JSON', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );

      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Invalid JSON response' }],
      });

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Failed to parse AI response');
    });

    test('handles AI schema validation errors', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );

      // Invalid response (missing required fields)
      const invalidResponse = {
        title: 'Test Recipe',
        // Missing description, cookingTime, etc.
      };

      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(invalidResponse) }],
      });

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('AI response validation failed');
    });

    test('handles Anthropic API errors', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );

      mockAnthropicClient.messages.create.mockRejectedValue(
        new Error('Anthropic API error')
      );

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Failed to analyze image');
    });
  });

  describe('Locale Handling', () => {
    test('uses English prompts for English locale', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'en');

      const mockAIResponse = {
        title: 'English Recipe',
        description: 'Recipe in English',
        cookingTime: '20 minutes',
        difficulty: 'Easy',
        servings: 2,
        ingredients: ['English ingredient'],
        instructions: ['English instruction'],
      };

      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockAIResponse) }],
      });

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest);

      // Verify the prompt was in English
      const promptCall = mockAnthropicClient.messages.create.mock.calls[0][0];
      expect(promptCall.messages[0].content).toContain(
        'Analyze this refrigerator image'
      );
    });

    test('uses Spanish prompts for Spanish locale', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );
      formData.append('locale', 'es');

      const mockAIResponse = {
        title: 'Receta Española',
        description: 'Receta en español',
        cookingTime: '20 minutos',
        difficulty: 'Easy', // Still uses English enum values as required
        servings: 2,
        ingredients: ['Ingrediente español'],
        instructions: ['Instrucción en español'],
      };

      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockAIResponse) }],
      });

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      await POST(mockRequest);

      // Verify the prompt was in Spanish
      const promptCall = mockAnthropicClient.messages.create.mock.calls[0][0];
      expect(promptCall.messages[0].content).toContain(
        'Analiza esta imagen de refrigerador'
      );
    });
  });

  describe('Performance and Edge Cases', () => {
    test('handles concurrent requests', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('test.jpg', 1000000, 'image/jpeg')
      );

      const mockAIResponse = {
        title: 'Concurrent Recipe',
        description: 'Recipe from concurrent request',
        cookingTime: '15 minutes',
        difficulty: 'Easy',
        servings: 1,
        ingredients: ['Concurrent ingredient'],
        instructions: ['Concurrent instruction'],
      };

      mockAnthropicClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockAIResponse) }],
      });

      const { POST } = await import('@/app/api/analyze-fridge/route');

      // Simulate concurrent requests
      const requests = Array(3)
        .fill(null)
        .map(() => {
          const mockRequest = createMockRequestWithFormData(formData);
          return POST(mockRequest);
        });

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });

    test('handles empty file', async () => {
      const formData = new FormData();
      formData.append(
        'image',
        createMockFile('empty.jpg', 0, 'image/jpeg', '')
      );

      const mockRequest = createMockRequestWithFormData(formData);
      const { POST } = await import('@/app/api/analyze-fridge/route');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('File size too large'); // 0 is handled by our validation
    });
  });
});
