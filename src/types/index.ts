// Core Recipe Types
export interface Recipe {
  title: string;
  description: string;
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: string[];
  instructions: string[];
  tips?: string[];
}

// API Request Types
export interface AnalyzeFridgeRequest {
  image: File;
  preferences?: string;
  dietaryRestrictions?: string[];
}

// API Response Types
export interface AnalyzeFridgeResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
  processingTime?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  statusCode: number;
}

// Upload Progress Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Error Handling Types
export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
}

// UI State Types
export interface UploadState {
  isUploading: boolean;
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
}

export interface AppState {
  recipe: Recipe | null;
  uploadState: UploadState;
  hasUploadedImage: boolean;
}

// Validation Types
export interface FileValidation {
  isValid: boolean;
  error?: string;
  file?: File;
}

// Configuration Types
export interface AppConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  apiTimeout: number;
  retryAttempts: number;
}

// User Settings Types
export interface UserSettings {
  version: string; // For future migrations
  lastUpdated: string;
  cookingPreferences: CookingPreferences;
  kitchenEquipment: KitchenEquipment;
  apiConfiguration: ApiConfiguration;
}

export interface CookingPreferences {
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  spiceLevel: 'mild' | 'medium' | 'spicy' | 'very-spicy';
  cookingTimePreference: 'quick' | 'moderate' | 'elaborate';
  mealTypes: string[];
  defaultServings: number;
  additionalNotes?: string;
}

export interface KitchenEquipment {
  basicAppliances: string[];
  advancedAppliances: string[];
  cookware: string[];
  bakingEquipment: string[];
  other: string[];
}

export interface ApiConfiguration {
  hasPersonalKey: boolean;
  keyValidated: boolean;
  usageTracking: boolean;
  lastValidation?: string;
}

// Settings Management Types
export interface SettingsValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SettingsExport {
  settings: UserSettings;
  exportDate: string;
  version: string;
}

// Enhanced API Types with Settings Support
export interface EnhancedAnalyzeFridgeRequest extends AnalyzeFridgeRequest {
  userSettings?: {
    cookingPreferences?: CookingPreferences;
    kitchenEquipment?: KitchenEquipment;
  };
  apiKey?: string; // User's personal API key
}
