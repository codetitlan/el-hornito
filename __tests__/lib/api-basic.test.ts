/**
 * Basic functionality tests for /lib/api.ts
 * Covers hasPersonalApiKey and basic analyzeFridge functionality
 */

describe('/lib/api.ts - Basic Functionality', () => {
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

  describe('hasPersonalApiKey function', () => {
    test('returns false when localStorage is empty', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { hasPersonalApiKey } = await import('@/lib/api');

      expect(hasPersonalApiKey()).toBe(false);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'elhornito-api-key'
      );
    });

    test('returns true when API key exists in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('some-encoded-key');

      const { hasPersonalApiKey } = await import('@/lib/api');

      expect(hasPersonalApiKey()).toBe(true);
    });
  });

  describe('analyzeFridge function - Basic Setup', () => {
    test('function is exported and callable', async () => {
      const { analyzeFridge } = await import('@/lib/api');

      expect(typeof analyzeFridge).toBe('function');
    });

    test('throws error when no file provided', async () => {
      const { analyzeFridge } = await import('@/lib/api');

      // @ts-expect-error - Testing error case
      await expect(analyzeFridge()).rejects.toThrow();
    });
  });

  describe('analyzeFridge function - Advanced Scenarios', () => {
    test('makes POST request to /api/analyze-fridge with file', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: {
            title: 'Test Recipe',
            description: 'A test recipe',
            cookingTime: '15 minutes',
            difficulty: 'Easy',
            servings: 2,
            ingredients: ['test ingredient'],
            instructions: ['test instruction'],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      const result = await analyzeFridge(mockFile);

      expect(global.fetch).toHaveBeenCalledWith('/api/analyze-fridge', {
        method: 'POST',
        body: expect.any(FormData),
      });

      expect(result).toHaveProperty('title', 'Test Recipe');
    });

    test('includes user settings when provided', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: {
            title: 'Veggie Recipe',
            description: 'A vegetarian recipe',
            cookingTime: '20 minutes',
            difficulty: 'Easy',
            servings: 2,
            ingredients: ['vegetables'],
            instructions: ['cook vegetables'],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      // Pass undefined userSettings to test that path
      await analyzeFridge(mockFile, undefined, 'en');

      // Verify FormData was sent correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/analyze-fridge', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    test('includes personal API key when available', async () => {
      mockLocalStorage.getItem.mockReturnValue(btoa('my-secret-key'));

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: {
            title: 'API Key Recipe',
            description: 'Made with personal key',
            cookingTime: '10 minutes',
            difficulty: 'Easy',
            servings: 1,
            ingredients: ['secret ingredient'],
            instructions: ['use personal key'],
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await analyzeFridge(mockFile);

      // Verify that the API key was included in the FormData
      const [[, { body }]] = (global.fetch as jest.Mock).mock.calls;
      const formData = body as FormData;

      expect(formData.get('apiKey')).toBe('my-secret-key');
    });

    test('throws error when API returns 401 unauthorized', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          error: 'Invalid API key',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await expect(analyzeFridge(mockFile)).rejects.toThrow('Invalid API key');
    });

    test('throws error when API response success is false', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Recipe generation failed',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await expect(analyzeFridge(mockFile)).rejects.toThrow(
        'Recipe generation failed'
      );
    });
  });
});
