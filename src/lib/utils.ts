import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_CONFIG } from './constants';
import { FileValidation } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// File validation utilities
export const validateFile = (file: File): FileValidation => {
  // Check file size
  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: APP_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  // Check file type
  const allowedTypes = APP_CONFIG.ALLOWED_FILE_TYPES as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: APP_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  return {
    isValid: true,
    file,
  };
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  // Handle edge cases
  if (bytes === 0) return '0 Bytes';
  if (bytes < 0) return `${bytes} Bytes`;
  if (!Number.isFinite(bytes) || Number.isNaN(bytes)) return '0 Bytes';

  // Handle decimal values less than 1
  if (bytes < 1) return `${bytes} Bytes`;

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Ensure we don't exceed the sizes array
  const sizeIndex = Math.min(i, sizes.length - 1);
  const size = bytes / Math.pow(k, sizeIndex);

  return `${parseFloat(size.toFixed(2))} ${sizes[sizeIndex]}`;
};

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

// Retry utility for API calls
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries: number = APP_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};
