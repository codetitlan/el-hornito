/**
 * Debug test to understand error flow
 */

import { classifyAnalysisError } from '@/lib/analyze-fridge/core';
import {
  AuthenticationError,
  RateLimitError,
} from '../__mocks__/@anthropic-ai/sdk';

describe('Error Classification Debug', () => {
  test('should classify AuthenticationError correctly', () => {
    const authError = new AuthenticationError('Invalid API key');
    console.log('AuthError:', authError);
    console.log('AuthError name:', authError.name);
    console.log('AuthError constructor name:', authError.constructor.name);

    const result = classifyAnalysisError(authError);
    console.log('Classification result:', result);

    expect(result.isAuthError).toBe(true);
    expect(result.status).toBe(401);
  });

  test('should classify RateLimitError correctly', () => {
    const rateLimitError = new RateLimitError('Rate limit exceeded');
    console.log('RateLimitError:', rateLimitError);
    console.log('RateLimitError name:', rateLimitError.name);
    console.log(
      'RateLimitError constructor name:',
      rateLimitError.constructor.name
    );

    const result = classifyAnalysisError(rateLimitError);
    console.log('Classification result:', result);

    expect(result.isRateLimit).toBe(true);
    expect(result.status).toBe(429);
  });
});
