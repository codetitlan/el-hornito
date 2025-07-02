// Types for analyze-fridge functionality
import { Recipe } from '@/types';

export interface UserCookingPreferences {
  cuisineTypes?: string[];
  dietaryRestrictions?: string[];
  spiceLevel?: 'mild' | 'medium' | 'spicy' | 'very-spicy';
  cookingTimePreference?: 'quick' | 'moderate' | 'elaborate';
  mealTypes?: string[];
  defaultServings?: number;
  additionalNotes?: string;
}

export interface UserKitchenEquipment {
  basicAppliances?: string[];
  advancedAppliances?: string[];
  cookware?: string[];
  bakingEquipment?: string[];
  other?: string[];
}

export interface UserSettings {
  cookingPreferences?: UserCookingPreferences;
  kitchenEquipment?: UserKitchenEquipment;
}

export interface AnalyzeFridgeInput {
  files: File[];
  userSettings: UserSettings | null;
  preferences: string | null;
  dietaryRestrictions: string | null;
  locale: 'en' | 'es';
  apiKey: string | null;
}

export interface AnalyzeFridgeResult {
  recipe: Recipe;
  processingTime: number;
}

export interface AnalyzeFridgeDependencies {
  anthropicClient: {
    messages: {
      create: (params: unknown) => Promise<unknown>;
    };
  };
  getApiKey: () => string | null;
  retryOperation: <T>(operation: () => Promise<T>) => Promise<T>;
}
