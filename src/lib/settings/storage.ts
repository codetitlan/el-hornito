/**
 * Settings Storage Module - Pure functions for localStorage operations
 * Handles loading, saving, and clearing settings from localStorage
 */

import { UserSettings } from '@/types';
import { SETTINGS_CONFIG } from '@/lib/constants';

/**
 * Load raw settings data from localStorage
 */
export function loadRawSettings(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(SETTINGS_CONFIG.STORAGE_KEY);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Save settings to localStorage
 */
export function saveRawSettings(settingsJson: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(SETTINGS_CONFIG.STORAGE_KEY, settingsJson);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Clear settings from localStorage
 */
export function clearStoredSettings(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(SETTINGS_CONFIG.STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if settings exist in localStorage
 */
export function hasStoredSettings(): boolean {
  const raw = loadRawSettings();
  return raw !== null;
}

/**
 * Parse settings JSON with error handling
 */
export function parseSettingsJson(json: string): UserSettings | null {
  try {
    return JSON.parse(json) as UserSettings;
  } catch (error) {
    console.error('Error parsing settings JSON:', error);
    return null;
  }
}

/**
 * Serialize settings to JSON
 */
export function serializeSettings(settings: UserSettings): string {
  return JSON.stringify(settings);
}
