/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enhanced API Route Test Utilities
 * Master-level infrastructure for bulletproof API testing
 */

import { NextRequest } from 'next/server';
import {
  AuthenticationError,
  RateLimitError,
  APIError,
} from '../__mocks__/@anthropic-ai/sdk'; // Import from our mock file

/**
 * Enhanced mock NextRequest with FormData support
 */
export function createMockRequestWithFormData(formData: FormData): NextRequest {
  return {
    formData: jest.fn().mockResolvedValue(formData),
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    cookies: new Map(),
    headers: new Headers(),
    nextUrl: new URL('http://localhost:3000'),
    method: 'POST',
    url: 'http://localhost:3000',
  } as unknown as NextRequest;
}

/**
 * Enhanced mock NextRequest with JSON support
 */
export function createMockRequestWithJSON(data: unknown): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(data),
    formData: jest.fn().mockResolvedValue(new FormData()),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    cookies: new Map(),
    headers: new Headers(),
    nextUrl: new URL('http://localhost:3000'),
    method: 'POST',
    url: 'http://localhost:3000',
  } as unknown as NextRequest;
}

/**
 * Mock NextRequest that throws errors for testing error handling
 */
export function createMockRequestWithError(error: Error): NextRequest {
  return {
    formData: jest.fn().mockRejectedValue(error),
    json: jest.fn().mockRejectedValue(error),
    text: jest.fn().mockRejectedValue(error),
    cookies: new Map(),
    headers: new Headers(),
    nextUrl: new URL('http://localhost:3000'),
    method: 'POST',
    url: 'http://localhost:3000',
  } as unknown as NextRequest;
}

/**
 * Enhanced Anthropic API Mock Manager
 * Provides consistent, realistic mock responses
 */
export class AnthropicMockManager {
  private mockCreate: jest.Mock;

  constructor(mockCreate: jest.Mock) {
    this.mockCreate = mockCreate;
  }

  /**
   * Mock successful recipe generation
   */
  mockSuccessfulRecipe(locale: 'en' | 'es' = 'en') {
    const recipe = {
      en: {
        title: 'Mediterranean Pasta Salad',
        description:
          'A fresh and vibrant pasta salad with Mediterranean flavors',
        cookingTime: '25 minutes',
        difficulty: 'Easy',
        servings: 4,
        ingredients: [
          '2 cups pasta',
          '1 cup cherry tomatoes',
          '1/2 cup olives',
          '1/4 cup olive oil',
        ],
        instructions: [
          'Cook pasta according to package directions',
          'Mix vegetables with olive oil',
          'Combine all ingredients and serve',
        ],
      },
      es: {
        title: 'Ensalada de Pasta Mediterránea',
        description:
          'Una ensalada de pasta fresca y vibrante con sabores mediterráneos',
        cookingTime: '25 minutos',
        difficulty: 'Easy', // Always English for validation
        servings: 4,
        ingredients: [
          '2 tazas de pasta',
          '1 taza de tomates cherry',
          '1/2 taza de aceitunas',
          '1/4 taza de aceite de oliva',
        ],
        instructions: [
          'Cocinar la pasta según las instrucciones del paquete',
          'Mezclar las verduras con aceite de oliva',
          'Combinar todos los ingredientes y servir',
        ],
      },
    };

    this.mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify(recipe[locale]),
        },
      ],
    });
  }

  /**
   * Mock malformed JSON response
   */
  mockMalformedJSON() {
    this.mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'invalid json {malformed',
        },
      ],
    });
  }

  /**
   * Mock invalid schema response
   */
  mockInvalidSchema() {
    this.mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            title: 'Recipe',
            description: 'Description',
            cookingTime: '20 minutes',
            difficulty: 'INVALID_DIFFICULTY', // This will fail schema validation
            servings: 2,
            ingredients: ['ingredient'],
            instructions: ['instruction'],
          }),
        },
      ],
    });
  }

  /**
   * Mock an authentication error (invalid API key)
   */
  mockAuthError() {
    this.mockCreate.mockRejectedValue(new AuthenticationError());
  }

  /**
   * Mock a rate limit error
   */
  mockRateLimitError() {
    this.mockCreate.mockRejectedValue(new RateLimitError());
  }

  /**
   * Mock a generic API error with a custom message
   */
  mockAPIError(message: string, status?: number) {
    this.mockCreate.mockRejectedValue(new APIError(message, status));
  }

  /**
   * Mock a successful empty or malformed response from Anthropic
   */
  mockEmptyOrMalformedResponse() {
    this.mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    });
  }
}

/**
 * NextResponse Mock Manager
 * Provides consistent response mocking
 */
export class NextResponseMockManager {
  private mockJson: jest.Mock;

  constructor(mockJson: jest.Mock) {
    this.mockJson = mockJson;
  }

  /**
   * Setup standard response behavior
   */
  setupStandardBehavior() {
    this.mockJson.mockImplementation((data, options = {}) => ({
      json: async () => data,
      status: options.status || 200,
      ok: (options.status || 200) < 400,
      headers: new Headers(),
      statusText: this.getStatusText(options.status || 200),
    }));
  }

  /**
   * Mock response that throws on json()
   */
  mockResponseError() {
    this.mockJson.mockImplementation((data, options = {}) => ({
      json: async () => {
        throw new Error('JSON parsing failed');
      },
      status: options.status || 500,
      ok: false,
      headers: new Headers(),
      statusText: this.getStatusText(options.status || 500),
    }));
  }

  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      400: 'Bad Request',
      401: 'Unauthorized',
      404: 'Not Found',
      405: 'Method Not Allowed',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };
    return statusTexts[status] || 'Unknown';
  }
}

/**
 * Test scenario builder for consistent test patterns
 */
export class TestScenarioBuilder {
  private scenarios: Array<{
    name: string;
    setup: () => void;
    data: any;
    expectedStatus: number;
    description: string;
  }> = [];

  /**
   * Add a test scenario
   */
  addScenario(
    name: string,
    setup: () => void,
    data: any,
    expectedStatus: number,
    description: string = ''
  ) {
    this.scenarios.push({ name, setup, data, expectedStatus, description });
    return this;
  }

  /**
   * Generate Jest test cases from scenarios
   */
  generateTests(apiRoute: any, testFunction: (scenario: any) => Promise<void>) {
    return this.scenarios.map((scenario) => ({
      name: scenario.name,
      test: async () => {
        scenario.setup();
        await testFunction({
          ...scenario,
          apiRoute,
        });
      },
    }));
  }

  /**
   * Clear all scenarios
   */
  clear() {
    this.scenarios = [];
    return this;
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure test execution time
   */
  static async measureExecution<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Assert test execution is under threshold
   */
  static assertPerformance(
    duration: number,
    threshold: number,
    testName: string
  ) {
    if (duration > threshold) {
      throw new Error(
        `${testName} took ${duration}ms, exceeding threshold of ${threshold}ms`
      );
    }
  }
}

/**
 * Mock validation utilities
 */
export class MockValidationUtils {
  /**
   * Validate that a mock was called with expected parameters
   */
  static validateMockCall(
    mock: jest.Mock,
    callIndex: number,
    expectedParams: any[]
  ) {
    expect(mock).toHaveBeenCalledTimes(callIndex + 1);
    expect(mock).toHaveBeenNthCalledWith(callIndex + 1, ...expectedParams);
  }

  /**
   * Validate mock call count and reset
   */
  static validateAndResetMock(mock: jest.Mock, expectedCalls: number) {
    expect(mock).toHaveBeenCalledTimes(expectedCalls);
    mock.mockClear();
  }

  /**
   * Create a spy that tracks all method calls
   */
  static createMethodSpy(obj: any, methods: string[]) {
    const spies: Record<string, jest.SpyInstance> = {};
    methods.forEach((method) => {
      spies[method] = jest.spyOn(obj, method);
    });
    return spies;
  }
}
