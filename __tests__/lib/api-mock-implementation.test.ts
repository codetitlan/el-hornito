/**
 * Mock API implementation tests for /lib/api.ts
 * Covers mock API functionality and customization scenarios
 */

// Mock Anthropic to prevent real API calls
jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

describe('/lib/api.ts - Mock API Implementation', () => {
  // Mock localStorage for browser environment
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeAll(() => {
    // Mock window.localStorage if not already defined
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
    } else {
      Object.defineProperty(global, 'window', {
        value: { localStorage: mockLocalStorage },
        writable: true,
      });
    }

    global.fetch = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Mock API Implementation Coverage (Lines 186-245)', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const originalNodeEnv = process.env.NODE_ENV;
    const originalApiKey = process.env.ANTHROPIC_API_KEY;

    // Mock development environment without API key to trigger mock API
    beforeEach(() => {
      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });
      delete process.env.ANTHROPIC_API_KEY;
      mockLocalStorage.getItem.mockReturnValue(null);
    });

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
      });
      if (originalApiKey) {
        process.env.ANTHROPIC_API_KEY = originalApiKey;
      }
    });

    test('uses mock API in development without env API key', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      const progressCallback = jest.fn();
      const statusCallback = jest.fn();

      const result = await analyzeFridge(mockFile, undefined, 'en', {
        onProgress: progressCallback,
        onStatusUpdate: statusCallback,
      });

      // Verify mock API was used (check console log)
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔧 Using mock API in development mode - no ANTHROPIC_API_KEY found'
      );

      // Verify mock recipe structure
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('cookingTime');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('servings');
      expect(result).toHaveProperty('ingredients');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('tips');

      // Verify progress callbacks were called
      expect(progressCallback).toHaveBeenCalledWith(10);
      expect(progressCallback).toHaveBeenCalledWith(30);
      expect(progressCallback).toHaveBeenCalledWith(60);
      expect(progressCallback).toHaveBeenCalledWith(90);
      expect(progressCallback).toHaveBeenCalledWith(100);

      // Verify status callbacks were called
      expect(statusCallback).toHaveBeenCalledWith('Preparing image...');
      expect(statusCallback).toHaveBeenCalledWith('Uploading to server...');
      expect(statusCallback).toHaveBeenCalledWith('Analyzing ingredients...');
      expect(statusCallback).toHaveBeenCalledWith('Generating recipe...');
      expect(statusCallback).toHaveBeenCalledWith('Complete!');

      consoleSpy.mockRestore();
    });

    test('customizes mock recipe for vegetarian cuisine preference', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      const mockUserSettings = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: ['vegetarian', 'italian'],
          dietaryRestrictions: [],
          spiceLevel: 'medium' as const,
          cookingTimePreference: 'moderate' as const,
          mealTypes: ['dinner'],
          defaultServings: 4,
        },
        kitchenEquipment: {
          basicAppliances: ['oven', 'stovetop'],
          advancedAppliances: [],
          cookware: ['pan'],
          bakingEquipment: [],
          other: [],
        },
        apiConfiguration: {
          hasPersonalKey: false,
          keyValidated: false,
          usageTracking: false,
        },
      };

      const result = await analyzeFridge(mockFile, mockUserSettings, 'en');

      // Verify vegetarian customization
      expect(result.title).toBe('Vegetarian Garden Pasta');
      expect(result.description).toBe(
        'A delicious vegetarian pasta made with fresh garden vegetables'
      );

      consoleSpy.mockRestore();
    });

    test('customizes mock recipe for gluten-free dietary restriction', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      const mockUserSettings = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: ['mediterranean'],
          dietaryRestrictions: ['gluten-free'],
          spiceLevel: 'medium' as const,
          cookingTimePreference: 'moderate' as const,
          mealTypes: ['dinner'],
          defaultServings: 4,
        },
        kitchenEquipment: {
          basicAppliances: ['oven', 'stovetop'],
          advancedAppliances: [],
          cookware: ['pan'],
          bakingEquipment: [],
          other: [],
        },
        apiConfiguration: {
          hasPersonalKey: false,
          keyValidated: false,
          usageTracking: false,
        },
      };

      const result = await analyzeFridge(mockFile, mockUserSettings, 'en');

      // Verify gluten-free customization in ingredients
      const pastaIngredients = result.ingredients.filter((ingredient: string) =>
        ingredient.includes('pasta')
      );
      expect(
        pastaIngredients.some((ingredient: string) =>
          ingredient.includes('gluten-free')
        )
      ).toBe(true);

      consoleSpy.mockRestore();
    });

    test('returns Spanish mock recipe when locale is es', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      const result = await analyzeFridge(mockFile, undefined, 'es');

      // Verify Spanish localization
      expect(result.title).toBe('Pasta Mediterránea con Verduras');
      expect(result.description).toBe(
        'Un plato de pasta fresco y saludable con las verduras de tu nevera'
      );
      expect(result.cookingTime).toBe('25 minutos');

      consoleSpy.mockRestore();
    });

    test('customizes Spanish mock recipe for vegetarian preference', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      const mockUserSettings = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: ['vegetarian'],
          dietaryRestrictions: [],
          spiceLevel: 'medium' as const,
          cookingTimePreference: 'moderate' as const,
          mealTypes: ['dinner'],
          defaultServings: 4,
        },
        kitchenEquipment: {
          basicAppliances: ['oven', 'stovetop'],
          advancedAppliances: [],
          cookware: ['pan'],
          bakingEquipment: [],
          other: [],
        },
        apiConfiguration: {
          hasPersonalKey: false,
          keyValidated: false,
          usageTracking: false,
        },
      };

      const result = await analyzeFridge(mockFile, mockUserSettings, 'es');

      // Verify Spanish vegetarian customization
      expect(result.title).toBe('Pasta Vegetariana del Huerto');
      expect(result.description).toBe(
        'Una deliciosa pasta vegetariana hecha con verduras frescas del huerto'
      );

      consoleSpy.mockRestore();
    });

    test('customizes Spanish mock recipe for gluten-free restriction', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      const mockUserSettings = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: ['italian'],
          dietaryRestrictions: ['gluten-free'],
          spiceLevel: 'medium' as const,
          cookingTimePreference: 'moderate' as const,
          mealTypes: ['dinner'],
          defaultServings: 4,
        },
        kitchenEquipment: {
          basicAppliances: ['oven', 'stovetop'],
          advancedAppliances: [],
          cookware: ['pan'],
          bakingEquipment: [],
          other: [],
        },
        apiConfiguration: {
          hasPersonalKey: false,
          keyValidated: false,
          usageTracking: false,
        },
      };

      const result = await analyzeFridge(mockFile, mockUserSettings, 'es');

      // Verify Spanish gluten-free customization
      const pastaIngredients = result.ingredients.filter((ingredient: string) =>
        ingredient.includes('pasta')
      );
      expect(
        pastaIngredients.some((ingredient: string) =>
          ingredient.includes('sin gluten')
        )
      ).toBe(true);

      consoleSpy.mockRestore();
    });

    test('handles mock API without callbacks', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      // Should not throw error when no callbacks provided
      const result = await analyzeFridge(mockFile);

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');

      consoleSpy.mockRestore();
    });
  });
});
