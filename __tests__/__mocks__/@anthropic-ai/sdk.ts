/**
 * Global mock for @anthropic-ai/sdk
 * This ensures that all tests use mocked Anthropic API calls instead of real ones
 */

// --- Mock Anthropic Error Classes ---
// These classes mimic the structure of errors thrown by the real Anthropic SDK.
export class AnthropicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnthropicError';
    // This is necessary to make `instanceof` work correctly in Jest environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends AnthropicError {
  status: number;

  constructor(message = 'invalid api key') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

export class RateLimitError extends AnthropicError {
  status: number;

  constructor(message = 'rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
  }
}

export class APIError extends AnthropicError {
  status: number;

  constructor(message = 'api error', status = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// Default mock response - simple valid recipe for fallback
const defaultMockResponse = {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        title: 'Default Test Recipe',
        description: 'A simple test recipe',
        cookingTime: '10 minutes',
        difficulty: 'Easy',
        servings: 2,
        ingredients: ['test ingredient'],
        instructions: ['test instruction'],
      }),
    },
  ],
};

// Create a mock implementation that can be controlled in tests
export const mockMessagesCreate = jest
  .fn()
  .mockResolvedValue(defaultMockResponse);

// The main Anthropic class constructor with additional properties for testing
const Anthropic = jest.fn().mockImplementation(() => ({
  messages: {
    create: mockMessagesCreate,
  },
})) as jest.Mock & {
  mockMessagesCreate: jest.Mock;
  resetMocks: () => void;
  setupResponse: (response: object) => void;
  setupError: (error: Error) => void;
};

// Expose utility methods on the constructor
Anthropic.mockMessagesCreate = mockMessagesCreate;
Anthropic.resetMocks = () => {
  mockMessagesCreate.mockClear();
  mockMessagesCreate.mockResolvedValue(defaultMockResponse);
};

// Helper functions for setting up test scenarios
Anthropic.setupResponse = (response: object) => {
  mockMessagesCreate.mockResolvedValue({
    content: [
      {
        type: 'text',
        text: JSON.stringify(response),
      },
    ],
  });
};

Anthropic.setupError = (error: Error) => {
  mockMessagesCreate.mockRejectedValue(error);
};

// Default export for 'import Anthropic from...' style
export default Anthropic;
// Named export for 'import { Anthropic } from...' style
export { Anthropic };
