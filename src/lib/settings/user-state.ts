/**
 * User State Module - Pure functions for user state and preference checking
 * Handles new user detection and preference analysis
 */

import { UserSettings } from '@/types';

/**
 * Check if user has configured basic preferences
 */
export function hasConfiguredPreferences(settings: UserSettings): boolean {
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
export function getSmartDefaults(): Partial<UserSettings> {
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
 * Analyze user preferences and provide insights
 */
export function analyzeUserPreferences(settings: UserSettings): {
  totalCuisines: number;
  totalRestrictions: number;
  totalEquipment: number;
  isMinimalUser: boolean;
  isAdvancedUser: boolean;
} {
  const totalCuisines = settings.cookingPreferences.cuisineTypes.length;
  const totalRestrictions =
    settings.cookingPreferences.dietaryRestrictions.length;
  const totalEquipment = [
    ...settings.kitchenEquipment.basicAppliances,
    ...settings.kitchenEquipment.advancedAppliances,
    ...settings.kitchenEquipment.cookware,
    ...settings.kitchenEquipment.bakingEquipment,
    ...settings.kitchenEquipment.other,
  ].length;

  return {
    totalCuisines,
    totalRestrictions,
    totalEquipment,
    isMinimalUser: totalCuisines <= 1 && totalEquipment <= 3,
    isAdvancedUser:
      totalCuisines >= 5 ||
      totalEquipment >= 10 ||
      settings.kitchenEquipment.advancedAppliances.length > 0,
  };
}
