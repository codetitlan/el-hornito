// User settings processing functions - Pure functions for easy testing
import { UserSettings } from './types';

// Process user settings from form data - Pure function
export function processUserSettings(userSettingsJson: string | null): {
  userSettings: UserSettings | null;
  error?: string;
} {
  if (!userSettingsJson) {
    return { userSettings: null };
  }

  try {
    const userSettings = JSON.parse(userSettingsJson);
    return { userSettings };
  } catch (error) {
    console.error('Failed to parse user settings:', error);
    return {
      userSettings: null,
      error: 'Invalid user settings format',
    };
  }
}

// Extract and validate locale from request - Pure function
export function extractLocale(localeValue: string | null): 'en' | 'es' {
  if (localeValue === 'es' || localeValue === 'en') {
    return localeValue;
  }
  return 'en'; // Default fallback
}

// Process legacy dietary restrictions - Pure function
export function processLegacyDietaryRestrictions(
  dietaryRestrictions: string | null
): string[] {
  if (!dietaryRestrictions) {
    return [];
  }

  try {
    const restrictions = JSON.parse(dietaryRestrictions);
    return Array.isArray(restrictions) ? restrictions : [];
  } catch (error) {
    console.error('Error parsing legacy dietary restrictions:', error);
    return [];
  }
}

// Validate API key format - Pure function
export function validateApiKeyFormat(apiKey: string | null): {
  isValid: boolean;
  error?: string;
} {
  if (!apiKey) {
    return { isValid: false, error: 'No API key provided' };
  }

  if (!apiKey.startsWith('sk-ant-api')) {
    return {
      isValid: false,
      error: 'Invalid API key format',
    };
  }

  return { isValid: true };
}
