/**
 * Test Suite for Settings Edge Cases
 * Tests error handling and edge case scenarios
 */

describe('Settings Edge Cases and Error Handling', () => {
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

  describe('localStorage Error Handling', () => {
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

    test('handles localStorage setItem quota exceeded', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();
      const settings = manager.loadSettings();

      const result = manager.saveSettings(settings);
      expect(result).toBe(false);
    });

    test('handles localStorage removeItem error', async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove error');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = manager.clearSettings();
      expect(result).toBe(false);
    });
  });

  describe('Malformed Data Handling', () => {
    test('handles non-JSON string in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('not-json-at-all');

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();
      expect(settings).toBeDefined();
      expect(settings.version).toBe('1.0.0');
    });

    test('handles null localStorage value', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();
      expect(settings).toBeDefined();
      expect(settings.version).toBe('1.0.0');
    });

    test('handles undefined localStorage value', async () => {
      mockLocalStorage.getItem.mockReturnValue(undefined);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();
      expect(settings).toBeDefined();
      expect(settings.version).toBe('1.0.0');
    });
  });

  describe('Browser Environment Edge Cases', () => {
    test('handles undefined window object', async () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing server environment
      delete global.window;

      const { SettingsManager } = await import('@/lib/settings');
      SettingsManager.resetInstance();
      const manager = SettingsManager.getInstance();

      // Should not throw in server environment
      expect(() => manager.loadSettings()).not.toThrow();
      expect(() => manager.saveSettings(manager.loadSettings())).not.toThrow();
      expect(() => manager.clearSettings()).not.toThrow();

      global.window = originalWindow;
    });

    test('handles missing localStorage in browser', async () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing environment without localStorage
      global.window = {};

      const { SettingsManager } = await import('@/lib/settings');
      SettingsManager.resetInstance();
      const manager = SettingsManager.getInstance();

      // Should handle missing localStorage gracefully
      const settings = manager.loadSettings();
      expect(settings).toBeDefined();

      global.window = originalWindow;
    });
  });

  describe('Concurrent Operation Handling', () => {
    test('handles multiple simultaneous getInstance calls', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      SettingsManager.resetInstance();

      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve(SettingsManager.getInstance())
      );

      const instances = await Promise.all(promises);

      // All should be the same instance
      const firstInstance = instances[0];
      instances.forEach((instance) => {
        expect(instance).toBe(firstInstance);
      });
    });

    test('handles rapid save/load operations', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const settings = manager.loadSettings();

      // Rapid save operations
      const savePromises = Array.from({ length: 5 }, () =>
        Promise.resolve(manager.saveSettings(settings))
      );

      const results = await Promise.all(savePromises);
      results.forEach((result) => {
        expect(typeof result).toBe('boolean');
      });
    });
  });
});
