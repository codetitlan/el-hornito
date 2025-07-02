/**
 * Settings Import/Export Module - Pure functions for JSON serialization
 * Handles import/export functionality for settings backup/restore
 */

import { UserSettings, SettingsExport } from '@/types';
import { SETTINGS_CONFIG } from '@/lib/constants';
import { validateSettings } from './validation';
import { migrateSettings } from './migration';

/**
 * Export settings to JSON string
 */
export function exportSettings(settings: UserSettings): string {
  const exportData: SettingsExport = {
    settings,
    exportDate: new Date().toISOString(),
    version: SETTINGS_CONFIG.CURRENT_VERSION,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import settings from JSON string
 */
export function importSettings(data: string): {
  success: boolean;
  error?: string;
  settings?: UserSettings;
} {
  try {
    const parsed = JSON.parse(data) as SettingsExport;

    // Validate import structure
    if (!parsed.settings || !parsed.version) {
      return { success: false, error: 'Invalid import format' };
    }

    // Migrate if needed
    const migrated = migrateSettings(parsed.settings);
    const validation = validateSettings(migrated);

    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid settings: ${validation.errors.join(', ')}`,
      };
    }

    return { success: true, settings: migrated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    };
  }
}

/**
 * Validate export data structure
 */
export function validateExportData(data: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    const parsed = JSON.parse(data);

    if (!parsed.settings || !parsed.version || !parsed.exportDate) {
      return { isValid: false, error: 'Missing required export fields' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid JSON format' };
  }
}
