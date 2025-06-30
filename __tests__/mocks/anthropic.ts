/**
 * Anthropic API Mocks
 * Provides realistic mock responses for Anthropic SDK testing
 */

import { expectedResponses } from '../helpers/test-data';

export interface MockAnthropicResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

/**
 * Mock Anthropic client with realistic responses
 */
export const createMockAnthropicClient = () => ({
  messages: {
    create: jest.fn(),
  },
});

/**
 * Anthropic API mock responses for different scenarios
 */
export const anthropicMocks = {
  /**
   * Successful recipe generation response
   */
  successResponse: (
    recipe = expectedResponses.validRecipe
  ): MockAnthropicResponse => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify(recipe),
      },
    ],
  }),

  /**
   * Spanish recipe generation response
   */
  spanishResponse: (): MockAnthropicResponse => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify(expectedResponses.spanishRecipe),
      },
    ],
  }),

  /**
   * Response with extra text around JSON (common Claude behavior)
   */
  responseWithExtraText: (
    recipe = expectedResponses.validRecipe
  ): MockAnthropicResponse => ({
    content: [
      {
        type: 'text',
        text: `Here's a recipe based on your fridge contents:\n\n${JSON.stringify(
          recipe
        )}\n\nEnjoy your cooking!`,
      },
    ],
  }),

  /**
   * Malformed JSON response
   */
  malformedResponse: (): MockAnthropicResponse => ({
    content: [
      {
        type: 'text',
        text: '{ "title": "Incomplete Recipe", "description": "Missing closing brace"',
      },
    ],
  }),

  /**
   * Response with invalid difficulty value (the bug we fixed)
   */
  invalidDifficultyResponse: (): MockAnthropicResponse => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          ...expectedResponses.validRecipe,
          difficulty: 'Fácil', // Spanish difficulty that should fail validation
        }),
      },
    ],
  }),

  /**
   * Empty response content
   */
  emptyResponse: (): MockAnthropicResponse => ({
    content: [
      {
        type: 'text',
        text: '',
      },
    ],
  }),

  /**
   * Response with missing required fields
   */
  incompleteRecipeResponse: (): MockAnthropicResponse => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          title: 'Incomplete Recipe',
          // Missing required fields like description, cookingTime, etc.
        }),
      },
    ],
  }),
};

/**
 * Anthropic API error scenarios
 */
export const anthropicErrors = {
  /**
   * Rate limiting error
   */
  rateLimitError: () => {
    const error = new Error('rate_limit_exceeded');
    Object.assign(error, {
      status: 429,
      message: 'rate_limit',
      type: 'rate_limit_error',
    });
    throw error;
  },

  /**
   * Authentication error
   */
  authError: () => {
    const error = new Error('unauthorized');
    Object.assign(error, {
      status: 401,
      message: 'authentication_error',
      type: 'authentication_error',
    });
    throw error;
  },

  /**
   * Invalid request error
   */
  invalidRequestError: () => {
    const error = new Error('invalid_request');
    Object.assign(error, {
      status: 400,
      message: 'invalid_request',
      type: 'invalid_request_error',
    });
    throw error;
  },

  /**
   * Permission denied error
   */
  permissionError: () => {
    const error = new Error('permission_denied');
    Object.assign(error, {
      status: 403,
      message: 'permission_denied',
      type: 'permission_error',
    });
    throw error;
  },

  /**
   * Network timeout error
   */
  timeoutError: () => {
    const error = new Error('Network timeout');
    Object.assign(error, {
      code: 'TIMEOUT',
      type: 'network_error',
    });
    throw error;
  },

  /**
   * Generic API error
   */
  genericError: () => {
    const error = new Error('Internal server error');
    Object.assign(error, {
      status: 500,
      type: 'api_error',
    });
    throw error;
  },
};

/**
 * Mock setup helper for Anthropic API responses
 */
export function setupAnthropicMock(
  mockClient: ReturnType<typeof createMockAnthropicClient>,
  scenario: keyof typeof anthropicMocks | keyof typeof anthropicErrors
) {
  if (scenario in anthropicMocks) {
    const response = anthropicMocks[scenario as keyof typeof anthropicMocks]();
    mockClient.messages.create.mockResolvedValue(response);
  } else if (scenario in anthropicErrors) {
    const errorFn = anthropicErrors[scenario as keyof typeof anthropicErrors];
    mockClient.messages.create.mockImplementation(errorFn);
  } else {
    throw new Error(`Unknown mock scenario: ${scenario}`);
  }
}

/**
 * Reset all Anthropic mocks
 */
export function resetAnthropicMocks(
  mockClient: ReturnType<typeof createMockAnthropicClient>
) {
  mockClient.messages.create.mockReset();
}
