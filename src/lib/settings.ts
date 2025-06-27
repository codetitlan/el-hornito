import { UserSettings, SettingsValidation, SettingsExport } from '@/types';
import { createDefaultUserSettings, SETTINGS_CONFIG } from '@/lib/constants';

/**
 * SettingsManager - Handles all user settings operations
 * Provides localStorage management, validation, and import/export functionality
 */
export class SettingsManager {
  private static instance: SettingsManager;
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
   * Load settings from localStorage with fallback to defaults
   */
  public loadSettings(): UserSettings {
    try {
      if (typeof window === 'undefined') {
        // Server-side rendering fallback
        return createDefaultUserSettings();
      }

      const stored = localStorage.getItem(SETTINGS_CONFIG.STORAGE_KEY);
      if (!stored) {
        // No settings found, return defaults
        const defaultSettings = createDefaultUserSettings();
        this.settings = defaultSettings;
        return defaultSettings;
      }

      const parsed = JSON.parse(stored) as UserSettings;

      // Validate and migrate if needed
      const migrated = this.migrateSettings(parsed);
      const validation = this.validateSettings(migrated);

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
      if (typeof window === 'undefined') {
        return false;
      }

      // Validate before saving
      const validation = this.validateSettings(settings);
      if (!validation.isValid) {
        console.error('Cannot save invalid settings:', validation.errors);
        return false;
      }

      // Update timestamp
      const settingsToSave = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(
        SETTINGS_CONFIG.STORAGE_KEY,
        JSON.stringify(settingsToSave)
      );
      this.settings = settingsToSave;

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  /**
   * Validate API key with Anthropic
   */
  public async validateApiKey(key: string): Promise<boolean> {
    try {
      // Test the API key with a minimal request
      const response = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: key }),
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  /**
   * Export settings as JSON string
   */
  public exportSettings(): string {
    const currentSettings = this.settings || this.loadSettings();

    const exportData: SettingsExport = {
      settings: currentSettings,
      exportDate: new Date().toISOString(),
      version: SETTINGS_CONFIG.CURRENT_VERSION,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  public importSettings(data: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(data) as SettingsExport;

      // Validate import structure
      if (!parsed.settings || !parsed.version) {
        return { success: false, error: 'Invalid import format' };
      }

      // Migrate if needed
      const migrated = this.migrateSettings(parsed.settings);
      const validation = this.validateSettings(migrated);

      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid settings: ${validation.errors.join(', ')}`,
        };
      }

      // Save imported settings
      const saved = this.saveSettings(migrated);
      if (!saved) {
        return { success: false, error: 'Failed to save imported settings' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON format',
      };
    }
  }

  /**
   * Clear all settings and return to defaults
   */
  public clearSettings(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      localStorage.removeItem(SETTINGS_CONFIG.STORAGE_KEY);
      this.settings = null;
      return true;
    } catch (error) {
      console.error('Error clearing settings:', error);
      return false;
    }
  }

  /**
   * Get current settings without loading from storage
   */
  public getCurrentSettings(): UserSettings | null {
    return this.settings;
  }

  /**
   * Check if user is new (no previous settings saved)
   */
  public isNewUser(): boolean {
    try {
      if (typeof window === 'undefined') {
        return true;
      }

      const stored = localStorage.getItem(SETTINGS_CONFIG.STORAGE_KEY);
      return !stored;
    } catch {
      return true;
    }
  }

  /**
   * Check if user has configured basic preferences
   */
  public hasConfiguredPreferences(): boolean {
    const settings = this.loadSettings();
    return (
      settings.cookingPreferences.cuisineTypes.length > 0 ||
      settings.cookingPreferences.dietaryRestrictions.length > 0 ||
      settings.cookingPreferences.spiceLevel !== 'medium' ||
      settings.cookingPreferences.cookingTimePreference !== 'moderate'
    );
  }

  /**
   * Get smart default suggestions based on common preferences
   */
  public getSmartDefaults(): Partial<UserSettings> {
    return {
      cookingPreferences: {
        cuisineTypes: ['comfort-food', 'healthy'],
        dietaryRestrictions: [],
        spiceLevel: 'medium',
        cookingTimePreference: 'moderate',
        mealTypes: ['dinner', 'lunch'],
        defaultServings: 4,
        additionalNotes: '',
      },
      kitchenEquipment: {
        basicAppliances: ['oven', 'stovetop', 'microwave'],
        advancedAppliances: [],
        cookware: ['pan', 'pot', 'baking-sheet'],
        bakingEquipment: [],
        other: [],
      },
    };
  }

  /**
   * Validate settings object
   */
  private validateSettings(settings: UserSettings): SettingsValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!settings.version || typeof settings.version !== 'string') {
      errors.push('Missing or invalid version');
    }

    if (!settings.lastUpdated || typeof settings.lastUpdated !== 'string') {
      errors.push('Missing or invalid lastUpdated');
    }

    if (!settings.cookingPreferences) {
      errors.push('Missing cookingPreferences');
    } else {
      // Validate cooking preferences
      if (!Array.isArray(settings.cookingPreferences.cuisineTypes)) {
        errors.push('Invalid cuisineTypes format');
      }

      if (!Array.isArray(settings.cookingPreferences.dietaryRestrictions)) {
        errors.push('Invalid dietaryRestrictions format');
      }

      if (
        !['mild', 'medium', 'spicy', 'very-spicy'].includes(
          settings.cookingPreferences.spiceLevel
        )
      ) {
        errors.push('Invalid spiceLevel');
      }

      if (
        !['quick', 'moderate', 'elaborate'].includes(
          settings.cookingPreferences.cookingTimePreference
        )
      ) {
        errors.push('Invalid cookingTimePreference');
      }

      if (
        typeof settings.cookingPreferences.defaultServings !== 'number' ||
        settings.cookingPreferences.defaultServings < 1 ||
        settings.cookingPreferences.defaultServings > 20
      ) {
        errors.push('Invalid defaultServings (must be 1-20)');
      }
    }

    if (!settings.kitchenEquipment) {
      errors.push('Missing kitchenEquipment');
    } else {
      // Validate kitchen equipment
      const equipmentFields = [
        'basicAppliances',
        'advancedAppliances',
        'cookware',
        'bakingEquipment',
        'other',
      ];
      for (const field of equipmentFields) {
        if (
          !Array.isArray(
            settings.kitchenEquipment[
              field as keyof typeof settings.kitchenEquipment
            ]
          )
        ) {
          errors.push(`Invalid ${field} format`);
        }
      }
    }

    if (!settings.apiConfiguration) {
      errors.push('Missing apiConfiguration');
    } else {
      // Validate API configuration
      if (typeof settings.apiConfiguration.hasPersonalKey !== 'boolean') {
        errors.push('Invalid hasPersonalKey');
      }

      if (typeof settings.apiConfiguration.keyValidated !== 'boolean') {
        errors.push('Invalid keyValidated');
      }

      if (typeof settings.apiConfiguration.usageTracking !== 'boolean') {
        errors.push('Invalid usageTracking');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Migrate settings from older versions
   */
  private migrateSettings(settings: UserSettings): UserSettings {
    // For now, just ensure all required fields exist
    const defaults = createDefaultUserSettings();
    const migrated = {
      ...defaults,
      ...settings,
      version: SETTINGS_CONFIG.CURRENT_VERSION, // Always update to current version
      lastUpdated: new Date().toISOString(), // Update migration timestamp
    };

    // Deep merge nested objects to preserve any existing data
    migrated.cookingPreferences = {
      ...defaults.cookingPreferences,
      ...settings.cookingPreferences,
    };

    migrated.kitchenEquipment = {
      ...defaults.kitchenEquipment,
      ...settings.kitchenEquipment,
    };

    migrated.apiConfiguration = {
      ...defaults.apiConfiguration,
      ...settings.apiConfiguration,
    };

    return migrated;
  }
}

// Export singleton instance
export const settingsManager = SettingsManager.getInstance();

// Helper hooks and utilities
export const useSettings = () => {
  if (typeof window === 'undefined') {
    return createDefaultUserSettings();
  }

  return settingsManager.loadSettings();
};

export const saveUserSettings = (settings: UserSettings): boolean => {
  return settingsManager.saveSettings(settings);
};

export const clearUserSettings = (): boolean => {
  return settingsManager.clearSettings();
};
