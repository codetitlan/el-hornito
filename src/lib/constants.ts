export const APP_CONFIG = {
  // File Upload Limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,

  // UI Constants
  UPLOAD_PROGRESS_STEPS: [
    'Preparing image...',
    'Uploading to server...',
    'Analyzing ingredients...',
    'Generating recipe...',
    'Complete!',
  ],

  // Recipe Difficulty Colors
  DIFFICULTY_COLORS: {
    Easy: 'text-green-600 bg-green-50',
    Medium: 'text-yellow-600 bg-yellow-50',
    Hard: 'text-red-600 bg-red-50',
  },

  // Error Messages
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'File size must be less than 10MB',
    INVALID_FILE_TYPE: 'Please upload a JPEG, PNG, or WebP image',
    UPLOAD_FAILED: 'Upload failed. Please try again.',
    ANALYSIS_FAILED: 'Failed to analyze image. Please try again.',
    NO_INGREDIENTS:
      'No ingredients detected in the image. Please try a different photo.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    API_ERROR: 'Service temporarily unavailable. Please try again later.',
  },
} as const;

// Environment Configuration (Runtime-aware)
export const ENV = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// Validation function for environment variables
export const validateEnvironment = () => {
  const errors: string[] = [];

  // ANTHROPIC_API_KEY is now optional - if not provided, users must use their own API keys
  if (!ENV.ANTHROPIC_API_KEY) {
    console.log(
      'No shared ANTHROPIC_API_KEY found - users will need to provide their own API keys'
    );
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return true;
};

// Claude AI Prompt Template
export const CLAUDE_PROMPT_TEMPLATE = `
Analyze this fridge photo and identify all visible ingredients. Based on the available ingredients, suggest ONE complete recipe that can be made primarily with these ingredients.

Please respond in this exact JSON format:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "cookingTime": "30 minutes",
  "difficulty": "Easy|Medium|Hard",
  "servings": 4,
  "ingredients": [
    "2 cups flour",
    "1 egg",
    "..."
  ],
  "instructions": [
    "Step 1: ...",
    "Step 2: ...",
    "..."
  ],
  "tips": ["Optional cooking tip 1", "..."]
}

Requirements:
- Use primarily ingredients visible in the photo
- Provide clear, step-by-step instructions
- Include realistic cooking times
- Consider dietary restrictions if mentioned
- Make the recipe practical and achievable
- If ingredients are unclear, make reasonable assumptions
`.trim();

// User Settings Constants
export const SETTINGS_CONFIG = {
  // Storage Configuration
  STORAGE_KEY: 'elhornito-user-settings',
  CURRENT_VERSION: '1.0.0',

  // Default Values
  DEFAULT_SERVINGS: 4,
  DEFAULT_SPICE_LEVEL: 'medium' as const,
  DEFAULT_COOKING_TIME: 'moderate' as const,

  // Available Options
  CUISINE_TYPES: [
    'Italian',
    'Asian',
    'Mexican',
    'Mediterranean',
    'American',
    'French',
    'Indian',
    'Thai',
    'Japanese',
    'Greek',
    'Spanish',
    'Middle Eastern',
    'Korean',
    'Vietnamese',
    'Chinese',
    'German',
    'Brazilian',
    'Other',
  ],

  DIETARY_RESTRICTIONS: [
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Dairy-free',
    'Nut-free',
    'Keto',
    'Paleo',
    'Low-carb',
    'Low-sodium',
    'Sugar-free',
    'Halal',
    'Kosher',
    'Pescatarian',
    'Raw food',
  ],

  SPICE_LEVELS: [
    { value: 'mild', label: 'Mild', description: 'Little to no heat' },
    { value: 'medium', label: 'Medium', description: 'Moderate spice level' },
    { value: 'spicy', label: 'Spicy', description: 'Hot and flavorful' },
    { value: 'very-spicy', label: 'Very Spicy', description: 'Intense heat' },
  ],

  COOKING_TIME_PREFERENCES: [
    {
      value: 'quick',
      label: 'Quick (≤30 min)',
      description: 'Fast meals for busy days',
    },
    {
      value: 'moderate',
      label: 'Moderate (30-60 min)',
      description: 'Balanced cooking time',
    },
    {
      value: 'elaborate',
      label: 'Elaborate (60+ min)',
      description: 'Detailed, complex recipes',
    },
  ],

  MEAL_TYPES: [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Desserts',
    'Appetizers',
    'Salads',
    'Soups',
    'Sandwiches',
    'Beverages',
  ],

  // Kitchen Equipment Categories
  BASIC_APPLIANCES: [
    'Oven',
    'Stovetop',
    'Microwave',
    'Refrigerator',
    'Freezer',
    'Toaster',
  ],

  ADVANCED_APPLIANCES: [
    'Air Fryer',
    'Instant Pot',
    'Slow Cooker',
    'Food Processor',
    'Blender',
    'Stand Mixer',
    'Rice Cooker',
    'Bread Maker',
    'Dehydrator',
    'Sous Vide',
  ],

  COOKWARE: [
    'Non-stick pans',
    'Cast iron skillet',
    'Stainless steel pots',
    'Wok',
    'Dutch oven',
    'Grill pan',
    'Steamer',
    'Roasting pan',
    'Stockpot',
  ],

  BAKING_EQUIPMENT: [
    'Baking sheets',
    'Cake pans',
    'Muffin tins',
    'Loaf pans',
    'Pie dishes',
    'Cookie cutters',
    'Rolling pin',
    'Measuring cups',
    'Kitchen scale',
  ],
} as const;

// Default Settings Object Factory
export const createDefaultUserSettings = () => ({
  version: SETTINGS_CONFIG.CURRENT_VERSION,
  lastUpdated: new Date().toISOString(),
  cookingPreferences: {
    cuisineTypes: [] as string[],
    dietaryRestrictions: [] as string[],
    spiceLevel: SETTINGS_CONFIG.DEFAULT_SPICE_LEVEL,
    cookingTimePreference: SETTINGS_CONFIG.DEFAULT_COOKING_TIME,
    mealTypes: [] as string[],
    defaultServings: SETTINGS_CONFIG.DEFAULT_SERVINGS,
    additionalNotes: undefined,
  },
  kitchenEquipment: {
    basicAppliances: ['Oven', 'Stovetop', 'Microwave'] as string[], // Common defaults
    advancedAppliances: [] as string[],
    cookware: [] as string[],
    bakingEquipment: [] as string[],
    other: [] as string[],
  },
  apiConfiguration: {
    hasPersonalKey: false,
    keyValidated: false,
    usageTracking: false,
    lastValidation: undefined,
  },
});

// Utility function to check if personal API keys are required
export const isPersonalApiKeyRequired = (): boolean => {
  return !ENV.ANTHROPIC_API_KEY;
};

// Get the API key configuration status
export const getApiKeyStatus = () => {
  return {
    hasSharedKey: !!ENV.ANTHROPIC_API_KEY,
    requiresPersonalKey: !ENV.ANTHROPIC_API_KEY,
    mode: ENV.ANTHROPIC_API_KEY ? 'shared' : 'personal-only',
  };
};
