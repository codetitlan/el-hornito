/**
 * Test Suite for Settings Import/Export
 * Tests import and export functionality for settings data
 */

describe('Settings Import/Export', () => {
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

  describe('Export Functionality', () => {
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

    test('exportSettings uses cached settings when available', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Load settings to cache them
      manager.loadSettings();

      // Mock getItem to return null to verify cache is used
      mockLocalStorage.getItem.mockReturnValue(null);

      const exportData = manager.exportSettings();
      const parsed = JSON.parse(exportData);

      expect(parsed.settings).toBeDefined();
      expect(parsed.settings.version).toBe('1.0.0');
    });
  });

  describe('Import Functionality', () => {
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

    test.skip('importSettings handles settings validation failure', async () => {
      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      const invalidSettingsData = JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        settings: {
          version: '1.0.0',
          // Invalid/incomplete settings structure
        },
      });

      const result = manager.importSettings(invalidSettingsData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('importSettings handles save failure during import', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { SettingsManager } = await import('@/lib/settings');
      const manager = SettingsManager.getInstance();

      // Create valid export data
      const exportData = manager.exportSettings();

      // Try to import when save fails
      const result = manager.importSettings(exportData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('save');
    });
  });
});
