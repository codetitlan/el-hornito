/**
 * Test Suite for Settings Migration
 * Tests migration logic for older settings versions
 */

describe('Settings Migration', () => {
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

  describe('Version Migration', () => {
    test('handles older version settings', async () => {
      const olderSettings = {
        version: '0.9.0', // Older version
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          spiceLevel: 'medium', // Different enum value
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(olderSettings));

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      // Should be migrated to current version
      expect(settings.version).toBe('1.0.0');
      expect(settings.cookingPreferences).toBeDefined();
    });

    test('handles completely missing properties', async () => {
      const incompleteSettings = {
        version: '1.0.0',
        // Missing most properties
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(incompleteSettings)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      // Should fill in missing properties with defaults
      expect(settings.cookingPreferences).toBeDefined();
      expect(settings.kitchenEquipment).toBeDefined();
      expect(settings.apiConfiguration).toBeDefined();
    });

    test('migrates settings with partial properties', async () => {
      const partialSettings = {
        version: '0.8.0',
        cookingPreferences: {
          spiceLevel: 'hot', // Old value that needs mapping
        },
        // Missing kitchenEquipment and apiConfiguration
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialSettings));

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      expect(settings.version).toBe('1.0.0');
      expect(settings.cookingPreferences.spiceLevel).toBeDefined();
      expect(settings.kitchenEquipment).toBeDefined();
      expect(settings.apiConfiguration).toBeDefined();
    });

    test('preserves valid existing data during migration', async () => {
      const settingsWithValidData = {
        version: '0.9.0',
        cookingPreferences: {
          cuisineTypes: ['italian', 'mexican'],
          dietaryRestrictions: ['vegetarian'],
          spiceLevel: 'medium',
        },
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(settingsWithValidData)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      // Should preserve existing valid data
      expect(settings.cookingPreferences.cuisineTypes).toEqual([
        'italian',
        'mexican',
      ]);
      expect(settings.cookingPreferences.dietaryRestrictions).toEqual([
        'vegetarian',
      ]);
      expect(settings.version).toBe('1.0.0'); // But update version
    });
  });

  describe('Edge Cases', () => {
    test('handles null version in settings', async () => {
      const settingsWithNullVersion = {
        version: null,
        cookingPreferences: {},
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(settingsWithNullVersion)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      expect(settings.version).toBe('1.0.0');
      expect(settings.cookingPreferences).toBeDefined();
    });

    test('handles empty settings object', async () => {
      mockLocalStorage.getItem.mockReturnValue('{}');

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      expect(settings.version).toBe('1.0.0');
      expect(settings.cookingPreferences).toBeDefined();
      expect(settings.kitchenEquipment).toBeDefined();
      expect(settings.apiConfiguration).toBeDefined();
    });
  });
});
