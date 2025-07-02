/**
 * Test Suite for Locale Management
 * Tests locale setting and retrieval functionality
 */

describe('Locale Management', () => {
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

  describe('Locale Setting', () => {
    test('setLocale updates locale in settings', async () => {
      mockLocalStorage.setItem.mockImplementation(() => true);

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const result = manager.setLocale('es');

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
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
  });

  describe('Locale Retrieval', () => {
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
});
