/**
 * Settings Migration Module - Pure functions for migrating settings between versions
 * Handles version migration and data transformation
 */

import { UserSettings } from '@/types';
import { createDefaultUserSettings, SETTINGS_CONFIG } from '@/lib/constants';

/**
 * Migrate settings from any older version to current version
 */
export function migrateSettings(settings: UserSettings): UserSettings {
  // For now, just ensure all required fields exist with defaults
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

/**
 * Check if settings need migration
 */
export function needsMigration(settings: UserSettings): boolean {
  return settings.version !== SETTINGS_CONFIG.CURRENT_VERSION;
}

/**
 * Get migration info for settings
 */
export function getMigrationInfo(settings: UserSettings): {
  fromVersion: string;
  toVersion: string;
  needsMigration: boolean;
} {
  return {
    fromVersion: settings.version || 'unknown',
    toVersion: SETTINGS_CONFIG.CURRENT_VERSION,
    needsMigration: needsMigration(settings),
  };
}
