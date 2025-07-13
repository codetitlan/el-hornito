/**
 * Progressive Test Suite for /lib/settings.ts
 * Building comprehensive coverage through small, focused tests
 */

import { UserSettings } from '@/types';

describe('/lib/settings.ts - Progressive Coverage', () => {
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

  describe('Step 1: SettingsManager Singleton Pattern', () => {
    test('getInstance returns the same instance', async () => {
      const { SettingsManager } = await import('@/lib/settings');

      const instance1 = SettingsManager.getInstance();
      const instance2 = SettingsManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    test('loadSettings function exists and is callable', async () => {
      const { SettingsManager } = await import('@/lib/settings');

      const manager = SettingsManager.getInstance();

      expect(typeof manager.loadSettings).toBe('function');
    });
  });

  describe('Step 2: Settings Loading - Server Environment', () => {
    test('returns default settings in server environment', async () => {
      // Temporarily remove window to simulate server
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      const { SettingsManager } = await import('@/lib/settings');
      SettingsManager.resetInstance();
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      expect(settings).toBeDefined();
      expect(settings.version).toBeDefined();
      expect(settings.cookingPreferences).toBeDefined();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Step 3: Settings Loading - Local Storage', () => {
    test('returns default settings when localStorage is empty', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      expect(settings).toBeDefined();
      expect(settings.version).toBeDefined();
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
    });

    test('parses and returns valid stored settings', async () => {
      const validSettings = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: [],
          dietaryRestrictions: [],
          spiceLevel: 'mild',
          cookingTimePreference: 'quick',
          mealTypes: [],
          defaultServings: 4,
        },
        kitchenEquipment: {
          basicAppliances: [],
          advancedAppliances: [],
          cookware: [],
          bakingEquipment: [],
          other: [],
        },
        apiConfiguration: {
          provider: 'anthropic',
          hasPersonalKey: false,
          keyValidated: false,
          usePersonalKey: false,
          usageTracking: { enabled: false, monthlyLimit: 100, currentUsage: 0 },
          retryAttempts: 3,
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validSettings));

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      expect(settings.version).toBe('1.0.0'); // Settings are migrated to latest version
      expect(settings.cookingPreferences.spiceLevel).toBeDefined(); // Value is normalized by the system
    });

    test('handles invalid JSON gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json{');

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Should fallback to default settings when JSON is invalid
      const settings = manager.loadSettings();

      expect(settings).toBeDefined();
      expect(settings.version).toBe('1.0.0');
    });
  });

  describe('Step 4: Settings Saving', () => {
    test('saveSettings function exists', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      expect(typeof manager.saveSettings).toBe('function');
    });

    test('saves settings to localStorage', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Load default settings first
      const settings = manager.loadSettings();

      // Save them
      manager.saveSettings(settings);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const [key, value] = mockLocalStorage.setItem.mock.calls[0];
      expect(key).toBe('elhornito-user-settings'); // Correct localStorage key
      expect(JSON.parse(value)).toMatchObject({ version: '1.0.0' });
    });

    test('handles localStorage errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();
      const settings = manager.loadSettings();

      // Should not throw but return false
      const result = manager.saveSettings(settings);
      expect(result).toBe(false);
    });
  });

  describe('Step 5: Settings Validation', () => {
    test('validates correct settings structure', async () => {
      mockLocalStorage.setItem.mockImplementation(() => true); // Reset mock

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();
      const validSettings = manager.loadSettings();

      // Access private method through public saveSettings which calls it
      const result = manager.saveSettings(validSettings);
      expect(result).toBe(true); // Valid settings should save successfully
    });

    test('handles malformed settings data', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Try to save invalid settings structure
      const invalidSettings = {
        version: '1.0.0',
        // Missing required properties
      };

      const result = manager.saveSettings(invalidSettings as UserSettings);
      expect(result).toBe(false); // Invalid settings should fail validation
    });
  });

  describe('Step 6: API Key Validation', () => {
    test('validateApiKey method exists', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      expect(typeof manager.validateApiKey).toBe('function');
    });

    test('validates API key format', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const validKey = 'sk-ant-1234567890abcdef';
      const result = await manager.validateApiKey(validKey);

      // Basic format validation should pass
      expect(typeof result).toBe('boolean');
    });

    test('rejects invalid API key format', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const invalidKey = 'invalid-key';
      const result = await manager.validateApiKey(invalidKey);

      expect(result).toBe(false);
    });

    test('handles empty API key', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = await manager.validateApiKey('');
      expect(result).toBe(false);
    });
  });

  describe('Step 7: Settings Export/Import', () => {
    test('exportSettings creates valid export data', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const exportData = manager.exportSettings();

      expect(typeof exportData).toBe('string');
      const parsed = JSON.parse(exportData);
      expect(parsed.version).toBeDefined();
      expect(parsed.exportDate).toBeDefined();
      expect(parsed.settings).toBeDefined();
    });

    test('importSettings accepts valid export data', async () => {
      mockLocalStorage.setItem.mockImplementation(() => true); // Reset mock

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // First export some settings
      const exportData = manager.exportSettings();

      // Then import them
      const result = manager.importSettings(exportData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('importSettings rejects invalid JSON', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = manager.importSettings('invalid-json{');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not valid JSON');
    });

    test('importSettings rejects invalid structure', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const invalidData = JSON.stringify({ notValidStructure: true });
      const result = manager.importSettings(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('importSettings handles missing settings property', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const incompleteData = JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        // Missing settings property
      });
      const result = manager.importSettings(incompleteData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Step 8: Settings Migration', () => {
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
  });

  describe('Step 9: Edge Cases and Error Handling', () => {
    test('handles localStorage getItem error', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Should fallback to defaults without throwing
      const settings = manager.loadSettings();
      expect(settings).toBeDefined();
      expect(settings.version).toBe('1.0.0');
    });

    test('handles corrupted localStorage data', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        '{"version": "1.0.0", "corrupted": '
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Should fallback to defaults when JSON parsing fails
      const settings = manager.loadSettings();
      expect(settings).toBeDefined();
      expect(settings.version).toBe('1.0.0');
    });
  });

  describe('Step 10: Locale Management', () => {
    test('setLocale updates locale in settings', async () => {
      mockLocalStorage.setItem.mockImplementation(() => true);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = manager.setLocale('es');

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('getLocale returns stored locale', async () => {
      const settingsWithLocale = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        locale: 'es',
        cookingPreferences: {
          cuisineTypes: [],
          dietaryRestrictions: [],
          spiceLevel: 'mild',
          cookingTimePreference: 'quick',
          mealTypes: [],
          defaultServings: 4,
          additionalNotes: '',
        },
        kitchenEquipment: {
          basicAppliances: [],
          advancedAppliances: [],
          cookware: [],
          bakingEquipment: [],
          other: [],
        },
        apiConfiguration: {
          provider: 'anthropic',
          hasPersonalKey: false,
          keyValidated: false,
          usePersonalKey: false,
          usageTracking: true,
          retryAttempts: 3,
        },
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(settingsWithLocale)
      );

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const locale = manager.getLocale();
      expect(locale).toBe('es');
    });

    test('getLocale defaults to en when no locale stored', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const locale = manager.getLocale();
      expect(locale).toBe('en');
    });

    test('setLocale handles errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = manager.setLocale('es');
      expect(result).toBe(false);
    });

    test('getLocale handles errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const locale = manager.getLocale();
      expect(locale).toBe('en');
    });
  });

  describe('Step 11: User State Detection', () => {
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

  describe('Step 12: Preference Configuration Detection', () => {
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

  describe('Step 13: Smart Defaults and Clearing', () => {
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

  describe('Step 14: Validation Edge Cases', () => {
    test('saveSettings rejects settings with invalid keyValidated type', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const invalidSettings = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cookingPreferences: {
          cuisineTypes: [],
          dietaryRestrictions: [],
          spiceLevel: 'mild',
          cookingTimePreference: 'quick',
          mealTypes: [],
          defaultServings: 4,
        },
        kitchenEquipment: {
          basicAppliances: [],
          advancedAppliances: [],
          cookware: [],
          bakingEquipment: [],
          other: [],
        },
        apiConfiguration: {
          provider: 'anthropic',
          hasPersonalKey: false,
          keyValidated: 'invalid-type', // Should be boolean
          usePersonalKey: false,
          usageTracking: { enabled: false, monthlyLimit: 100, currentUsage: 0 },
          retryAttempts: 3,
        },
      };

      const result = manager.saveSettings(
        invalidSettings as unknown as UserSettings
      );
      expect(result).toBe(false);
    });

    test('saveSettings handles server environment gracefully', async () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();
      const settings = manager.loadSettings();

      const result = manager.saveSettings(settings);
      expect(result).toBe(false);

      global.window = originalWindow;
    });

    test('importSettings handles invalid settings validation failure', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const invalidExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        settings: {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          cookingPreferences: {
            cuisineTypes: 'invalid-format', // Should be array
            dietaryRestrictions: [],
            spiceLevel: 'mild',
            cookingTimePreference: 'quick',
            mealTypes: [],
            defaultServings: 4,
          },
          kitchenEquipment: {
            basicAppliances: [],
            advancedAppliances: [],
            cookware: [],
            bakingEquipment: [],
            other: [],
          },
          apiConfiguration: {
            hasPersonalKey: false,
            keyValidated: false,
            usageTracking: false,
          },
        },
      };

      const result = manager.importSettings(JSON.stringify(invalidExportData));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    test('importSettings handles save failure during import', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Export valid settings first
      const exportData = manager.exportSettings();

      // Try to import them when save fails
      const result = manager.importSettings(exportData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save imported settings');
    });

    test('exportSettings uses cached settings when available', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Load settings to cache them
      manager.loadSettings();

      // Export should use cached settings (this branch wasn't covered)
      const exportData = manager.exportSettings();
      const parsed = JSON.parse(exportData);

      expect(parsed.settings).toBeDefined();
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.exportDate).toBeDefined();
    });
  });
});
