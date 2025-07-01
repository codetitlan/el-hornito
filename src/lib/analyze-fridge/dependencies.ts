// Dependency injection setup for analyze-fridge
import Anthropic from '@anthropic-ai/sdk';
import { ENV } from '@/lib/constants';
import { retryOperation } from '@/lib/utils';
import { AnalyzeFridgeDependencies } from './types';

// Create default dependencies using real services
export function createDefaultDependencies(
  personalApiKey?: string | null
): AnalyzeFridgeDependencies {
  // Determine which API key to use
  const apiKeyToUse = personalApiKey || ENV.ANTHROPIC_API_KEY;

  if (!apiKeyToUse) {
    throw new Error('No API key available');
  }

  // Create Anthropic client with appropriate API key
  const anthropicClient = new Anthropic({
    apiKey: apiKeyToUse,
  });

  return {
    anthropicClient: {
      messages: {
        create: (params: unknown) =>
          anthropicClient.messages.create(
            params as Parameters<typeof anthropicClient.messages.create>[0]
          ),
      },
    },
    getApiKey: () => apiKeyToUse,
    retryOperation,
  };
}

// Create test dependencies for testing
export function createTestDependencies(
  mockClient: {
    messages: {
      create: (params: unknown) => Promise<unknown>;
    };
  },
  mockApiKey: string = 'sk-ant-api-test-key'
): AnalyzeFridgeDependencies {
  return {
    anthropicClient: mockClient,
    getApiKey: () => mockApiKey,
    retryOperation: async <T>(operation: () => Promise<T>) => operation(),
  };
}
