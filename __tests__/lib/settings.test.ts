/**
 * Progressive Test Suite for /lib/settings.ts
 * Building comprehensive coverage through small, focused tests
 */

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
});
