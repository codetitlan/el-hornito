/**
 * Test Data Helpers
 * Provides realistic mock data for API testing
 */

export interface MockFile extends File {
  type: string;
  size: number;
  name: string;
}

/**
 * Creates a mock File object for testing file uploads
 */
export function createMockFile(
  type: string = 'image/jpeg',
  size: number = 100000,
  name: string = 'test-image.jpg'
): MockFile {
  const file = {
    type,
    size,
    name,
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(size)),
    text: jest.fn().mockResolvedValue('mock file content'),
    stream: jest.fn(),
    slice: jest.fn(),
    lastModified: Date.now(),
    webkitRelativePath: '',
  } as unknown as MockFile;

  return file;
}

/**
 * Test images of various types and sizes
 */
export const testImages = {
  validJPEG: createMockFile('image/jpeg', 100000, 'valid.jpg'),
  validPNG: createMockFile('image/png', 200000, 'valid.png'),
  validWebP: createMockFile('image/webp', 150000, 'valid.webp'),
  oversizedFile: createMockFile('image/jpeg', 10000000, 'oversized.jpg'), // 10MB
  invalidType: createMockFile('text/plain', 1000, 'invalid.txt'),
  emptyFile: createMockFile('image/jpeg', 0, 'empty.jpg'),
  corruptedFile: createMockFile('image/jpeg', 100000, 'corrupted.jpg'),
};

/**
 * User settings variations for testing
 */
export const userSettings = {
  minimal: {
    locale: 'en',
  },

  comprehensive: {
    cookingPreferences: {
      cuisineTypes: ['italian', 'mexican', 'asian'],
      dietaryRestrictions: ['vegetarian', 'gluten-free'],
      spiceLevel: 'medium',
      cookingTimePreference: 'quick',
      mealTypes: ['dinner', 'lunch'],
      defaultServings: 4,
      additionalNotes: 'I prefer healthy, colorful meals',
    },
    kitchenEquipment: {
      basicAppliances: ['oven', 'stovetop', 'microwave'],
      advancedAppliances: ['air-fryer', 'slow-cooker'],
      cookware: ['non-stick-pan', 'pot-set', 'wok'],
      bakingEquipment: ['baking-sheet', 'mixing-bowls'],
      other: ['food-processor'],
    },
    locale: 'es',
  },

  edge: {
    cookingPreferences: {
      cuisineTypes: [], // Empty array
      defaultServings: 1, // Minimum servings
      additionalNotes: 'A'.repeat(1000), // Very long notes
    },
    locale: 'en',
  },

  invalid: {
    cookingPreferences: {
      cuisineTypes: 'not-an-array', // Invalid type
      spiceLevel: 'super-hot', // Invalid enum value
      defaultServings: -1, // Negative number
    },
    locale: 'fr', // Unsupported locale
  },
};

/**
 * Expected API responses for testing
 */
export const expectedResponses = {
  validRecipe: {
    title: 'Test Recipe',
    description: 'A delicious test recipe for unit testing',
    cookingTime: '30 minutes',
    difficulty: 'Easy',
    servings: 4,
    ingredients: [
      '2 cups test ingredient A',
      '1 tablespoon test ingredient B',
      '3 medium test vegetables',
    ],
    instructions: [
      'Step 1: Prepare all test ingredients',
      'Step 2: Mix ingredients together',
      'Step 3: Cook for specified time',
      'Step 4: Serve and enjoy',
    ],
    tips: [
      'Make sure to use fresh test ingredients',
      'Can be prepared ahead of time',
    ],
  },

  spanishRecipe: {
    title: 'Receta de Prueba',
    description: 'Una deliciosa receta de prueba para pruebas unitarias',
    cookingTime: '30 minutos',
    difficulty: 'Easy', // Should still be English for schema validation
    servings: 4,
    ingredients: [
      '2 tazas de ingrediente de prueba A',
      '1 cucharada de ingrediente de prueba B',
      '3 vegetales medianos de prueba',
    ],
    instructions: [
      'Paso 1: Preparar todos los ingredientes de prueba',
      'Paso 2: Mezclar los ingredientes',
      'Paso 3: Cocinar por el tiempo especificado',
      'Paso 4: Servir y disfrutar',
    ],
    tips: [
      'Asegúrate de usar ingredientes de prueba frescos',
      'Se puede preparar con anticipación',
    ],
  },

  apiErrors: {
    rateLimitError: {
      success: false,
      error: 'Service is temporarily busy. Please try again in a moment.',
    },
    authError: {
      success: false,
      error:
        'Invalid personal API key. Please check your Anthropic API key in settings.',
    },
    invalidFileError: {
      success: false,
      error: 'No image file provided',
    },
    fileTooLargeError: {
      success: false,
      error:
        'File size exceeds the maximum limit of 5MB. Please upload a smaller image.',
    },
    invalidFileTypeError: {
      success: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    },
  },

  healthResponse: {
    status: 'healthy',
    timestamp: expect.any(String),
    environment: 'test',
    version: expect.any(String),
  },

  apiKeyValidation: {
    valid: {
      valid: true,
      message: 'API key is valid',
    },
    invalid: {
      valid: false,
      message: 'Invalid API key format or unauthorized',
    },
  },
};

/**
 * Creates realistic FormData for API requests
 */
export function createMockFormData(
  options: {
    image?: MockFile;
    userSettings?: Record<string, unknown>;
    preferences?: string;
    dietaryRestrictions?: string[];
    locale?: string;
    apiKey?: string;
  } = {}
): FormData {
  const formData = new FormData();

  if (options.image) {
    formData.append('image', options.image as unknown as Blob);
  }

  if (options.userSettings) {
    formData.append('userSettings', JSON.stringify(options.userSettings));
  }

  if (options.preferences) {
    formData.append('preferences', options.preferences);
  }

  if (options.dietaryRestrictions) {
    formData.append(
      'dietaryRestrictions',
      JSON.stringify(options.dietaryRestrictions)
    );
  }

  if (options.locale) {
    formData.append('locale', options.locale);
  }

  if (options.apiKey) {
    formData.append('apiKey', options.apiKey);
  }

  return formData;
}

/**
 * Mock NextRequest object for testing
 */
export function createMockNextRequest(
  options: {
    method?: string;
    formData?: FormData;
    json?: Record<string, unknown>;
    headers?: Record<string, string>;
  } = {}
): MockNextRequest {
  return {
    method: options.method || 'POST',
    formData: jest.fn().mockResolvedValue(options.formData || new FormData()),
    json: jest.fn().mockResolvedValue(options.json || {}),
    headers: new Map(Object.entries(options.headers || {})),
    url: 'http://localhost:3000/api/test',
  };
}

interface MockNextRequest {
  method: string;
  formData: jest.Mock;
  json: jest.Mock;
  headers: Map<string, string>;
  url: string;
}
