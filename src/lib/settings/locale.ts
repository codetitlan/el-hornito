/**
 * Locale Management Module - Pure functions for language preference handling
 * Handles locale setting and retrieval operations
 */

import { UserSettings } from '@/types';

export type SupportedLocale = 'en' | 'es';

/**
 * Set locale in settings object (pure function)
 */
export function setLocaleInSettings(
  settings: UserSettings,
  locale: SupportedLocale
): UserSettings {
  return {
    ...settings,
    locale,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get locale from settings with fallback
 */
export function getLocaleFromSettings(settings: UserSettings): SupportedLocale {
  return settings.locale || 'en';
}

/**
 * Validate locale value
 */
export function isValidLocale(locale: unknown): locale is SupportedLocale {
  return locale === 'en' || locale === 'es';
}

/**
 * Normalize locale value with fallback
 */
export function normalizeLocale(locale: unknown): SupportedLocale {
  return isValidLocale(locale) ? locale : 'en';
}
