/**
 * Settings Validation Module - Pure functions for validating settings
 * Handles all validation logic and schema checking
 */

import { UserSettings, SettingsValidation } from '@/types';

/**
 * Validate complete settings object
 */
export function validateSettings(settings: UserSettings): SettingsValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure validation
  if (!settings.version || typeof settings.version !== 'string') {
    errors.push('Missing or invalid version');
  }

  if (!settings.lastUpdated || typeof settings.lastUpdated !== 'string') {
    errors.push('Missing or invalid lastUpdated');
  }

  // Validate cooking preferences
  const cookingErrors = validateCookingPreferences(settings.cookingPreferences);
  errors.push(...cookingErrors);

  // Validate kitchen equipment
  const equipmentErrors = validateKitchenEquipment(settings.kitchenEquipment);
  errors.push(...equipmentErrors);

  // Validate API configuration
  const apiErrors = validateApiConfiguration(settings.apiConfiguration);
  errors.push(...apiErrors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate cooking preferences section
 */
function validateCookingPreferences(preferences: unknown): string[] {
  const errors: string[] = [];

  if (!preferences || typeof preferences !== 'object') {
    errors.push('Missing cookingPreferences');
    return errors;
  }

  const prefs = preferences as Record<string, unknown>;

  if (!Array.isArray(prefs.cuisineTypes)) {
    errors.push('Invalid cuisineTypes format');
  }

  if (!Array.isArray(prefs.dietaryRestrictions)) {
    errors.push('Invalid dietaryRestrictions format');
  }

  if (
    !['mild', 'medium', 'spicy', 'very-spicy'].includes(
      prefs.spiceLevel as string
    )
  ) {
    errors.push('Invalid spiceLevel');
  }

  if (
    !['quick', 'moderate', 'elaborate'].includes(
      prefs.cookingTimePreference as string
    )
  ) {
    errors.push('Invalid cookingTimePreference');
  }

  if (
    typeof prefs.defaultServings !== 'number' ||
    (prefs.defaultServings as number) < 1 ||
    (prefs.defaultServings as number) > 20
  ) {
    errors.push('Invalid defaultServings (must be 1-20)');
  }

  return errors;
}

/**
 * Validate kitchen equipment section
 */
function validateKitchenEquipment(equipment: unknown): string[] {
  const errors: string[] = [];

  if (!equipment || typeof equipment !== 'object') {
    errors.push('Missing kitchenEquipment');
    return errors;
  }

  const equip = equipment as Record<string, unknown>;
  const equipmentFields = [
    'basicAppliances',
    'advancedAppliances',
    'cookware',
    'bakingEquipment',
    'other',
  ];

  for (const field of equipmentFields) {
    if (!Array.isArray(equip[field])) {
      errors.push(`Invalid ${field} format`);
    }
  }

  return errors;
}

/**
 * Validate API configuration section
 */
function validateApiConfiguration(apiConfig: unknown): string[] {
  const errors: string[] = [];

  if (!apiConfig || typeof apiConfig !== 'object') {
    errors.push('Missing apiConfiguration');
    return errors;
  }

  const config = apiConfig as Record<string, unknown>;

  if (typeof config.hasPersonalKey !== 'boolean') {
    errors.push('Invalid hasPersonalKey');
  }

  if (typeof config.keyValidated !== 'boolean') {
    errors.push('Invalid keyValidated');
  }

  if (typeof config.usageTracking !== 'boolean') {
    errors.push('Invalid usageTracking');
  }

  return errors;
}
