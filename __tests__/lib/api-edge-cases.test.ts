/**
 * Edge cases and final coverage tests for /lib/api.ts
 * Covers remaining edge cases and branch coverage scenarios
 */

// Mock Anthropic to prevent real API calls
jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

describe('/lib/api.ts - Edge Cases and Final Coverage', () => {
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

  describe('Final Coverage: Remaining Edge Cases (Lines 52-53)', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    test('covers atob error logging branch completely', async () => {
      // Mock localStorage to return an invalid base64 that causes atob to throw
      mockLocalStorage.getItem.mockReturnValue(
        'invalid-base64-chars-!@#$%^&*()'
      );

      // Mock the actual atob function to throw a specific error
      const originalAtob = global.atob;
      global.atob = jest.fn().mockImplementation(() => {
        throw new Error('Invalid character in base64 string');
      });

      // Mock console.error to capture the error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      // Mock successful API response to ensure the test focuses on the error handling
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: { title: 'Test Recipe' },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await analyzeFridge(mockFile);

      // Verify the specific error was logged on lines 52-53
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to decode stored API key:',
        expect.objectContaining({
          message: 'Invalid character in base64 string',
        })
      );

      // Verify that the API call proceeded without the API key
      const [[, { body }]] = (global.fetch as jest.Mock).mock.calls;
      const formData = body as FormData;
      expect(formData.get('apiKey')).toBeNull();

      // Restore mocks
      global.atob = originalAtob;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Branch Coverage: Missing Conditions', () => {
    test('handles analyzeFridge without userSettings (covers line 51 false branch)', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: {
            title: 'Simple Recipe',
            description: 'A simple recipe without user settings',
            cookingTime: '10 minutes',
            difficulty: 'Easy',
            servings: 1,
            ingredients: ['basic ingredient'],
            instructions: ['basic instruction'],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      // Call without userSettings to test the false branch
      const result = await analyzeFridge(mockFile, undefined, 'en');

      expect(global.fetch).toHaveBeenCalledWith('/api/analyze-fridge', {
        method: 'POST',
        body: expect.any(FormData),
      });

      const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
      // Verify userSettings was NOT appended
      expect(formData.get('userSettings')).toBeNull();
      expect(result.title).toBe('Simple Recipe');
    });

    test('handles analyzeFridge without personalApiKey (covers line 56 false branch)', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: {
            title: 'Recipe Without Personal Key',
            description: 'A recipe without personal API key',
            cookingTime: '10 minutes',
            difficulty: 'Easy',
            servings: 1,
            ingredients: ['ingredient'],
            instructions: ['instruction'],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Mock localStorage to return no API key
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const { analyzeFridge } = await import('@/lib/api');

      // Call without personal API key to test the false branch
      const result = await analyzeFridge(mockFile, undefined, 'en');

      expect(global.fetch).toHaveBeenCalledWith('/api/analyze-fridge', {
        method: 'POST',
        body: expect.any(FormData),
      });

      const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
      // Verify apiKey was NOT appended
      expect(formData.get('apiKey')).toBeNull();
      expect(result.title).toBe('Recipe Without Personal Key');
    });

    test('covers both userSettings and personalApiKey false branches simultaneously', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: {
            title: 'Minimal Recipe',
            description: 'A minimal recipe without settings or personal key',
            cookingTime: '5 minutes',
            difficulty: 'Easy',
            servings: 1,
            ingredients: ['minimal ingredient'],
            instructions: ['minimal instruction'],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Mock localStorage to return no API key
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const { analyzeFridge } = await import('@/lib/api');

      // Call without both userSettings and personal API key
      const result = await analyzeFridge(mockFile, undefined, 'en');

      expect(global.fetch).toHaveBeenCalledWith('/api/analyze-fridge', {
        method: 'POST',
        body: expect.any(FormData),
      });

      const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
      // Verify neither userSettings nor apiKey were appended
      expect(formData.get('userSettings')).toBeNull();
      expect(formData.get('apiKey')).toBeNull();
      expect(result.title).toBe('Minimal Recipe');
    });

    test('covers mock recipe customization branches - non-vegetarian cuisine', async () => {
      // Mock console to avoid output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Mock environment to force mock API usage
      const originalNodeEnv = process.env.NODE_ENV;
      const originalApiKey = process.env.ANTHROPIC_API_KEY;

      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });
      delete process.env.ANTHROPIC_API_KEY;
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const userSettings = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: ['italian'], // Non-vegetarian cuisine
          dietaryRestrictions: [],
          spiceLevel: 'mild' as const,
          cookingTimePreference: 'quick' as const,
          mealTypes: ['dinner'],
          defaultServings: 2,
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

      const { analyzeFridge } = await import('@/lib/api');

      const result = await analyzeFridge(mockFile, userSettings, 'en');

      // Should get mock response with Italian cuisine customization
      expect(result.title).toContain('Italian');
      expect(result.description).toContain('italian');

      // Restore environment
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
      });
      if (originalApiKey) {
        process.env.ANTHROPIC_API_KEY = originalApiKey;
      }

      consoleSpy.mockRestore();
    });

    test('covers mock recipe with non-gluten-free dietary restrictions', async () => {
      // Mock console to avoid output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Mock environment to force mock API usage
      const originalNodeEnv = process.env.NODE_ENV;
      const originalApiKey = process.env.ANTHROPIC_API_KEY;

      jest.resetModules();
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });
      delete process.env.ANTHROPIC_API_KEY;
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const userSettings = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: ['mediterranean'],
          dietaryRestrictions: ['dairy-free'], // Non-gluten-free restriction
          spiceLevel: 'medium' as const,
          cookingTimePreference: 'moderate' as const,
          mealTypes: ['lunch'],
          defaultServings: 3,
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

      const { analyzeFridge } = await import('@/lib/api');

      const result = await analyzeFridge(mockFile, userSettings, 'en');

      // Should get mock response with dairy-free customization
      expect(result.description).toContain('dairy-free');

      // Restore environment
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
      });
      if (originalApiKey) {
        process.env.ANTHROPIC_API_KEY = originalApiKey;
      }

      consoleSpy.mockRestore();
    });
  });
});
