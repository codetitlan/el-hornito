// Simple test to debug the error classification
import { classifyAnalysisError } from '@/lib/analyze-fridge/core';

describe('Debug Error Classification', () => {
  test('should classify Invalid API key as auth error', () => {
    const error = new Error('Invalid API key');
    const result = classifyAnalysisError(error);

    console.log('Error message:', error.message);
    console.log('Classification result:', result);

    expect(result.isAuthError).toBe(true);
    expect(result.status).toBe(401);
  });
});
