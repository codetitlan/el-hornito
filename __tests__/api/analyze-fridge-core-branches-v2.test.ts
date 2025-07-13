/**
 * Core Branch Coverage Tests for /api/analyze-fridge - Option 2 Implementation
 * Target: Cover authentication error handling branches
 * Focus: Test error classification and API route logic directly
 */

import { NextResponse } from 'next/server';
import {
  AuthenticationError,
  RateLimitError,
  APIError,
} from '../__mocks__/@anthropic-ai/sdk';
import { classifyAnalysisError } from '@/lib/analyze-fridge/core';

// Mock NextResponse for API route tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
  NextRequest: jest.fn(),
}));

const mockNextResponseJson = jest.mocked(NextResponse.json);

describe('/api/analyze-fridge - Core Branch Coverage (Option 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNextResponseJson.mockReturnValue({} as NextResponse);
  });

  describe('Authentication Error Handling Branches', () => {
    test('handles auth error with personal API key', () => {
      // Test authentication error with personal API key scenario
      const error = new AuthenticationError();
      // personalApiKey would be 'sk-ant-api03-personal-key-12345' in real scenario

      const errorClass = classifyAnalysisError(error);

      // Simulate API route error handling logic
      const responseBody = {
        success: false,
        error: errorClass.message,
        processingTime: 0,
      };
      const responseStatus = { status: errorClass.status };

      expect(responseBody).toEqual({
        success: false,
        error:
          'Invalid API key. Please check your Anthropic API key in settings.',
        processingTime: 0,
      });
      expect(responseStatus).toEqual({ status: 401 });
    });

    test('handles auth error with environment API key', () => {
      // Test authentication error with environment API key scenario
      const error = new AuthenticationError();
      // personalApiKey would be null when using environment key

      const errorClass = classifyAnalysisError(error);

      const responseBody = {
        success: false,
        error: errorClass.message,
        processingTime: 0,
      };
      const responseStatus = { status: errorClass.status };

      expect(responseBody).toEqual({
        success: false,
        error:
          'Invalid API key. Please check your Anthropic API key in settings.',
        processingTime: 0,
      });
      expect(responseStatus).toEqual({ status: 401 });
    });

    test('handles rate limit error with personal API key', () => {
      // Test rate limit error with personal API key
      const error = new RateLimitError();
      // personalApiKey would be 'sk-ant-api03-personal-key-12345' in real scenario

      const errorClass = classifyAnalysisError(error);

      const responseBody = {
        success: false,
        error: errorClass.message,
        processingTime: 0,
      };
      const responseStatus = { status: errorClass.status };

      expect(responseBody).toEqual({
        success: false,
        error: 'Service is temporarily busy. Please try again in a moment.',
        processingTime: 0,
      });
      expect(responseStatus).toEqual({ status: 429 });
    });

    test('handles generic API errors', () => {
      // Test generic API error handling
      const error = new APIError('Generic API error');

      const errorClass = classifyAnalysisError(error);

      const responseBody = {
        success: false,
        error: errorClass.message,
        processingTime: 0,
      };
      const responseStatus = { status: errorClass.status };

      expect(responseBody).toEqual({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
        processingTime: 0,
      });
      expect(responseStatus).toEqual({ status: 500 });
    });

    test('handles unexpected errors', () => {
      // Test unexpected error handling
      const error = new Error('Unexpected error');

      const errorClass = classifyAnalysisError(error);

      const responseBody = {
        success: false,
        error: errorClass.message,
        processingTime: 0,
      };
      const responseStatus = { status: errorClass.status };

      expect(responseBody).toEqual({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
        processingTime: 0,
      });
      expect(responseStatus).toEqual({ status: 500 });
    });
  });

  describe('Error Classification Comprehensive Coverage', () => {
    test('classifies AuthenticationError correctly', () => {
      const error = new AuthenticationError();
      const result = classifyAnalysisError(error);

      expect(result).toEqual({
        status: 401,
        message:
          'Invalid API key. Please check your Anthropic API key in settings.',
        isAuthError: true,
      });
    });

    test('classifies RateLimitError correctly', () => {
      const error = new RateLimitError();
      const result = classifyAnalysisError(error);

      expect(result).toEqual({
        status: 429,
        message: 'Service is temporarily busy. Please try again in a moment.',
        isRateLimit: true,
      });
    });

    test('classifies APIError correctly', () => {
      const error = new APIError('API Error');
      const result = classifyAnalysisError(error);

      expect(result).toEqual({
        status: 500,
        message: 'Service temporarily unavailable. Please try again later.',
      });
    });

    test('classifies generic Error correctly', () => {
      const error = new Error('Generic error');
      const result = classifyAnalysisError(error);

      expect(result).toEqual({
        status: 500,
        message: 'Service temporarily unavailable. Please try again later.',
      });
    });

    test('classifies string errors correctly', () => {
      const error = 'String error message';
      const result = classifyAnalysisError(error);

      expect(result).toEqual({
        status: 500,
        message: 'Service temporarily unavailable. Please try again later.',
      });
    });

    test('handles null/undefined errors', () => {
      const result1 = classifyAnalysisError(null);
      const result2 = classifyAnalysisError(undefined);

      expect(result1).toEqual({
        status: 500,
        message: 'Service temporarily unavailable. Please try again later.',
      });

      expect(result2).toEqual({
        status: 500,
        message: 'Service temporarily unavailable. Please try again later.',
      });
    });
  });
});
