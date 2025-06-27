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

// File conversion utilities
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Image compression utility
export const compressImage = async (
  file: File,
  maxWidth: number = 1024
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw compressed image
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original file
          }
        },
        file.type,
        0.8
      ); // 80% quality
    };

    img.src = URL.createObjectURL(file);
  });
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Recipe formatting utilities
export const formatCookingTime = (time: string): string => {
  // Normalize cooking time format
  const cleanTime = time.toLowerCase().trim();

  if (cleanTime.includes('min')) {
    return cleanTime;
  }

  if (cleanTime.includes('hour')) {
    return cleanTime;
  }

  // Assume minutes if no unit specified
  const numMatch = cleanTime.match(/\d+/);
  if (numMatch) {
    return `${numMatch[0]} minutes`;
  }

  return time;
};

// Local storage utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if localStorage is not available
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
};
