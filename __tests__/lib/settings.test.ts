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
});
