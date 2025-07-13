// Dependency injection setup for analyze-fridge
import Anthropic from '@anthropic-ai/sdk';
import { ENV } from '@/lib/constants';
import { retryOperation } from '@/lib/utils';
import { AnalyzeFridgeDependencies } from './types';

// Create default dependencies using real services
export function createDefaultDependencies(
  personalApiKey?: string | null
): AnalyzeFridgeDependencies {
  console.log(
    'DEBUG: createDefaultDependencies called with personalApiKey:',
    personalApiKey
  );

  // Determine which API key to use - prioritize personal API key
  const apiKeyToUse = personalApiKey || ENV.ANTHROPIC_API_KEY;

  if (!apiKeyToUse) {
    throw new Error(
      'Authentication failed - no API key available - please provide a personal API key or configure ANTHROPIC_API_KEY environment variable'
    );
  }

  console.log(
    'DEBUG: Creating Anthropic client with key:',
    apiKeyToUse?.substring(0, 10) + '...'
  );

  // Create Anthropic client with appropriate API key
  const anthropicClient = new Anthropic({
    apiKey: apiKeyToUse,
  });

  console.log('DEBUG: Anthropic client created:', typeof anthropicClient);

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
