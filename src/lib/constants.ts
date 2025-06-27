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

// Environment Configuration
export const ENV = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// Validation function for environment variables
export const validateEnvironment = () => {
  const errors: string[] = [];

  if (!ENV.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY environment variable is required');
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
