/**
 * Test Suite for User State Management
 * Tests user state detection and preference analysis functionality
 */

describe('User State Management', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('New User Detection', () => {
    test('isNewUser returns true when no settings exist', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const isNew = manager.isNewUser();
      expect(isNew).toBe(true);
    });

    test('isNewUser returns false when settings exist', async () => {
      mockLocalStorage.getItem.mockReturnValue('{"version": "1.0.0"}');

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const isNew = manager.isNewUser();
      expect(isNew).toBe(false);
    });

    test.skip('isNewUser handles server environment', async () => {
      const originalWindow = global.window;

      const { SettingsManager } = await import('@/lib/settings');

      // Temporarily remove window to simulate server
      // @ts-expect-error - Testing server environment
      delete global.window;

      // Verify window is actually undefined
      console.log('Testing SSR environment - window:', typeof window);
      expect(typeof window).toBe('undefined');

      // Reset singleton to ensure clean state for SSR simulation
      SettingsManager.resetInstance();
      const manager = SettingsManager.getInstance();

      const isNew = manager.isNewUser();
      expect(isNew).toBe(true);

      global.window = originalWindow;
    });

    test('isNewUser handles localStorage errors', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const isNew = manager.isNewUser();
      expect(isNew).toBe(true);
    });
  });

  describe('Preference Configuration Detection', () => {
    test('hasConfiguredPreferences returns false for default settings', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const hasConfig = manager.hasConfiguredPreferences();
      expect(hasConfig).toBe(false);
    });

    test('hasConfiguredPreferences returns true when cuisineTypes configured', async () => {
      const settingsWithCuisine = {
        version: '1.0.0',
        cookingPreferences: {
          cuisineTypes: ['italian'],
          dietaryRestrictions: [],
          spiceLevel: 'medium',
          cookingTimePreference: 'moderate',
        },
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(settingsWithCuisine)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const hasConfig = manager.hasConfiguredPreferences();
      expect(hasConfig).toBe(true);
    });

    test('hasConfiguredPreferences returns true when dietaryRestrictions configured', async () => {
      const settingsWithDiet = {
        version: '1.0.0',
        cookingPreferences: {
          cuisineTypes: [],
          dietaryRestrictions: ['vegetarian'],
          spiceLevel: 'medium',
          cookingTimePreference: 'moderate',
        },
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(settingsWithDiet)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const hasConfig = manager.hasConfiguredPreferences();
      expect(hasConfig).toBe(true);
    });

    test('hasConfiguredPreferences returns true when spiceLevel changed', async () => {
      const settingsWithSpice = {
        version: '1.0.0',
        cookingPreferences: {
          cuisineTypes: [],
          dietaryRestrictions: [],
          spiceLevel: 'spicy',
          cookingTimePreference: 'moderate',
        },
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(settingsWithSpice)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const hasConfig = manager.hasConfiguredPreferences();
      expect(hasConfig).toBe(true);
    });

    test('hasConfiguredPreferences returns true when cookingTimePreference changed', async () => {
      const settingsWithTime = {
        version: '1.0.0',
        cookingPreferences: {
          cuisineTypes: [],
          dietaryRestrictions: [],
          spiceLevel: 'medium',
          cookingTimePreference: 'quick',
        },
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(settingsWithTime)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const hasConfig = manager.hasConfiguredPreferences();
      expect(hasConfig).toBe(true);
    });
  });

  describe('Smart Defaults and Clearing', () => {
    test('getSmartDefaults returns comprehensive default preferences', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const defaults = manager.getSmartDefaults();

      expect(defaults.cookingPreferences).toBeDefined();
      expect(defaults.cookingPreferences?.cuisineTypes).toEqual([
        'comfort-food',
        'healthy',
      ]);
      expect(defaults.cookingPreferences?.spiceLevel).toBe('medium');
      expect(defaults.cookingPreferences?.defaultServings).toBe(4);
      expect(defaults.kitchenEquipment).toBeDefined();
      expect(defaults.kitchenEquipment?.basicAppliances).toContain('oven');
    });

    test('clearSettings removes data from localStorage', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = manager.clearSettings();

      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'elhornito-user-settings'
      );
    });

    test.skip('clearSettings handles server environment', async () => {
      const originalWindow = global.window;

      const { SettingsManager } = await import('@/lib/settings');

      // Temporarily remove window to simulate server
      // @ts-expect-error - Testing server environment
      delete global.window;

      console.log('Testing SSR clearSettings - window:', typeof window);

      // Reset singleton to ensure clean state for SSR simulation
      SettingsManager.resetInstance();
      const manager = SettingsManager.getInstance();

      const result = manager.clearSettings();
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    test('clearSettings handles localStorage errors', async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = manager.clearSettings();
      expect(result).toBe(false);
    });
  });
});
