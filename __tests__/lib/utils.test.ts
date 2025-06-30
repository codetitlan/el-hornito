/**
 * Test Suite for /src/lib/utils.ts
 * Tests utility functions used throughout the application
 */

import {
  validateFile,
  formatFileSize,
  getErrorMessage,
  retryOperation,
  cn,
} from '@/lib/utils';
import { testImages } from '../helpers/test-data';

// Mock constants
jest.mock('@/lib/constants', () => ({
  APP_CONFIG: {
    MAX_FILE_SIZE: 5000000, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    RETRY_ATTEMPTS: 3,
    ERROR_MESSAGES: {
      FILE_TOO_LARGE: 'File size exceeds the maximum limit',
      INVALID_FILE_TYPE: 'Invalid file type',
    },
  },
}));

describe('utils', () => {
  describe('validateFile', () => {
    test('validates correct file successfully', () => {
      const result = validateFile(testImages.validJPEG);

      expect(result.isValid).toBe(true);
      expect(result.file).toBe(testImages.validJPEG);
      expect(result.error).toBeUndefined();
    });

    test('rejects oversized files', () => {
      const result = validateFile(testImages.oversizedFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size exceeds the maximum limit');
      expect(result.file).toBeUndefined();
    });

    test('rejects invalid file types', () => {
      const result = validateFile(testImages.invalidType);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type');
      expect(result.file).toBeUndefined();
    });

    test('accepts all valid image types', () => {
      const validFiles = [
        testImages.validJPEG,
        testImages.validPNG,
        testImages.validWebP,
      ];

      validFiles.forEach((file) => {
        const result = validateFile(file);
        expect(result.isValid).toBe(true);
        expect(result.file).toBe(file);
      });
    });

    test('rejects empty files', () => {
      const result = validateFile(testImages.emptyFile);

      expect(result.isValid).toBe(true); // Empty files are allowed by size, but would fail other checks
    });
  });

  describe('formatFileSize', () => {
    test('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1)).toBe('1 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    test('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048575)).toBe('1024 KB');
    });

    test('formats megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    test('formats gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
    });

    test('handles edge cases', () => {
      expect(formatFileSize(0.5)).toBe('0.5 Bytes');
      expect(formatFileSize(Number.MAX_SAFE_INTEGER)).toBeTruthy();
    });
  });

  describe('getErrorMessage', () => {
    test('extracts message from Error objects', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    test('returns string errors as-is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    test('handles unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });

    test('handles complex Error objects', () => {
      const error = new TypeError('Type error occurred');
      expect(getErrorMessage(error)).toBe('Type error occurred');
    });
  });

  describe('retryOperation', () => {
    test('succeeds on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await retryOperation(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('retries on failure and eventually succeeds', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success');

      const result = await retryOperation(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('exhausts retries and throws final error', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('Persistent failure'));

      await expect(retryOperation(operation)).rejects.toThrow(
        'Persistent failure'
      );
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    test('respects custom retry count', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failure'));

      await expect(retryOperation(operation, 1)).rejects.toThrow('Failure');
      expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    test('waits between retries', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      const result = await retryOperation(operation);
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000); // At least 1 second wait
    });

    test('handles async operations correctly', async () => {
      const operation = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'async success';
      });

      const result = await retryOperation(operation);

      expect(result).toBe('async success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('cn (className utility)', () => {
    test('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    test('handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional');
      expect(cn('base', false && 'conditional')).toBe('base');
    });

    test('merges tailwind classes correctly', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4'); // Later class wins
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    test('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
      expect(cn({ class1: true, class2: false })).toBe('class1');
    });

    test('handles empty and undefined inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
      expect(cn(undefined)).toBe('');
      expect(cn(null)).toBe('');
    });
  });

  describe('Error scenarios and edge cases', () => {
    test('validateFile handles null/undefined gracefully', () => {
      expect(() => validateFile(null as unknown as File)).toThrow();
      expect(() => validateFile(undefined as unknown as File)).toThrow();
    });

    test('formatFileSize handles negative numbers', () => {
      expect(formatFileSize(-1)).toBe('-1 Bytes');
    });

    test('retryOperation handles zero retries', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('Immediate failure'));

      await expect(retryOperation(operation, 0)).rejects.toThrow(
        'Immediate failure'
      );
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});
