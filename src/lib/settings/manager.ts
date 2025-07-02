/**
 * Settings Manager - Core orchestrator for all settings operations
 * Uses focused modules for specific functionality areas
 */

import { UserSettings } from '@/types';
import { createDefaultUserSettings } from '@/lib/constants';

// Import specialized modules
import {
  loadRawSettings,
  saveRawSettings,
  clearStoredSettings,
  hasStoredSettings,
  parseSettingsJson,
  serializeSettings,
} from './storage';
import { validateSettings } from './validation';
import { migrateSettings } from './migration';
import { exportSettings, importSettings } from './import-export';
import { validateApiKey } from './api-key';
import {
  setLocaleInSettings,
  getLocaleFromSettings,
  type SupportedLocale,
} from './locale';
import { hasConfiguredPreferences, getSmartDefaults } from './user-state';

/**
 * SettingsManager - Simplified orchestrator using focused modules
 */
export class SettingsManager {
  private static instance: SettingsManager | null;
  private settings: UserSettings | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of SettingsManager
   */
  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * TESTING ONLY: Reset the singleton instance (for test isolation)
   */
  public static resetInstance(): void {
    SettingsManager.instance = null;
  }

  /**
   * Load settings from localStorage with fallback to defaults
   */
  public loadSettings(): UserSettings {
    try {
      // Server-side rendering fallback
      if (typeof window === 'undefined') {
        return createDefaultUserSettings();
      }

      const raw = loadRawSettings();
      if (!raw) {
        // No settings found, return defaults
        const defaultSettings = createDefaultUserSettings();
        this.settings = defaultSettings;
        return defaultSettings;
      }

      const parsed = parseSettingsJson(raw);
      if (!parsed) {
        // Invalid JSON, return defaults
        const defaultSettings = createDefaultUserSettings();
        this.settings = defaultSettings;
        return defaultSettings;
      }

      // Validate and migrate if needed
      const migrated = migrateSettings(parsed);
      const validation = validateSettings(migrated);

      if (!validation.isValid) {
        console.warn(
          'Invalid settings found, using defaults:',
          validation.errors
        );
        const defaultSettings = createDefaultUserSettings();
        this.settings = defaultSettings;
        return defaultSettings;
      }

      this.settings = migrated;
      return migrated;
    } catch (error) {
      console.error('Error loading settings:', error);
      const defaultSettings = createDefaultUserSettings();
      this.settings = defaultSettings;
      return defaultSettings;
    }
  }

  /**
   * Save settings to localStorage
   */
  public saveSettings(settings: UserSettings): boolean {
    try {
      // Server-side rendering fallback
      if (typeof window === 'undefined') {
        return false;
      }

      // Validate before saving
      const validation = validateSettings(settings);
      if (!validation.isValid) {
        console.error('Cannot save invalid settings:', validation.errors);
        return false;
      }

      // Update timestamp
      const settingsToSave = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      const json = serializeSettings(settingsToSave);
      const success = saveRawSettings(json);

      if (success) {
        this.settings = settingsToSave;
      }

      return success;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  /**
   * Clear all settings and return to defaults
   */
  public clearSettings(): boolean {
    // Always reset cache, even in SSR
    this.settings = null;
    if (typeof window === 'undefined') return false; // SSR: cannot clear
    return clearStoredSettings();
  }

  /**
   * Export settings as JSON string
   */
  public exportSettings(): string {
    const currentSettings = this.settings || this.loadSettings();
    return exportSettings(currentSettings);
  }

  /**
   * Import settings from JSON string
   */
  public importSettings(data: string): { success: boolean; error?: string } {
    const result = importSettings(data);

    if (result.success && result.settings) {
      const saved = this.saveSettings(result.settings);
      if (!saved) {
        return { success: false, error: 'Failed to save imported settings' };
      }
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Validate API key
   */
  public async validateApiKey(key: string): Promise<boolean> {
    return validateApiKey(key);
  }

  /**
   * Set user's preferred locale
   */
  public setLocale(locale: SupportedLocale): boolean {
    try {
      const settings = this.loadSettings();
      const updatedSettings = setLocaleInSettings(settings, locale);
      return this.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to set locale:', error);
      return false;
    }
  }

  /**
   * Get user's preferred locale with fallback to 'en'
   */
  public getLocale(): SupportedLocale {
    try {
      const settings = this.loadSettings();
      return getLocaleFromSettings(settings);
    } catch (error) {
      console.error('Failed to get locale:', error);
      return 'en';
    }
  }

  /**
   * Check if user is new (no previous settings saved)
   */
  public isNewUser(): boolean {
    if (typeof window === 'undefined') {
      console.log('isNewUser: SSR mode, returning true');
      return true; // SSR: always new
    }
    const hasSettings = hasStoredSettings();
    console.log('isNewUser: hasStoredSettings =', hasSettings);
    return !hasSettings;
  }

  /**
   * Check if user has configured basic preferences
   */
  public hasConfiguredPreferences(): boolean {
    const settings = this.loadSettings();
    return hasConfiguredPreferences(settings);
  }

  /**
   * Get smart default suggestions based on common preferences
   */
  public getSmartDefaults(): Partial<UserSettings> {
    return getSmartDefaults();
  }

  /**
   * Get current settings without loading from storage
   */
  public getCurrentSettings(): UserSettings | null {
    return this.settings;
  }
}

// Export singleton instance
export const settingsManager = SettingsManager.getInstance();
