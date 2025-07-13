/**
 * Isolated test to debug error classification
 */

import { AuthenticationError } from './__mocks__/@anthropic-ai/sdk';
import { classifyAnalysisError } from '@/lib/analyze-fridge/core';

describe('Error Classification Debug', () => {
  test('should correctly classify AuthenticationError', () => {
    const authError = new AuthenticationError('invalid api key');

    console.log('=== ERROR DEBUG ===');
    console.log('Error object:', authError);
    console.log('Error name:', authError.name);
    console.log('Error constructor name:', authError.constructor.name);
    console.log(
      'Error instanceof AuthenticationError:',
      authError instanceof AuthenticationError
    );
    console.log('==================');

    const result = classifyAnalysisError(authError);

    console.log('=== CLASSIFICATION RESULT ===');
    console.log('Result:', result);
    console.log('isAuthError:', result.isAuthError);
    console.log('status:', result.status);
    console.log('============================');

    expect(result.isAuthError).toBe(true);
    expect(result.status).toBe(401);
  });

  test('should handle regular Error', () => {
    const regularError = new Error('some error');

    console.log('=== REGULAR ERROR DEBUG ===');
    console.log('Error object:', regularError);
    console.log('Error name:', regularError.name);
    console.log('Error constructor name:', regularError.constructor.name);
    console.log('==========================');

    const result = classifyAnalysisError(regularError);

    console.log('=== CLASSIFICATION RESULT ===');
    console.log('Result:', result);
    console.log('isAuthError:', result.isAuthError);
    console.log('status:', result.status);
    console.log('============================');

    expect(result.status).toBe(500);
  });
});
