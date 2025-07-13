/**
 * Error handling tests for /lib/api.ts
 * Covers error paths and exception handling scenarios
 */

describe('/lib/api.ts - Error Handling', () => {
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

  describe('Error Handling Paths (Lines 52-53, 81, 84)', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    test('handles API key decode failure gracefully', async () => {
      // Mock invalid base64 encoding that will cause atob to fail
      mockLocalStorage.getItem.mockReturnValue('invalid-base64-!@#$%');

      // Mock console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { analyzeFridge } = await import('@/lib/api');

      // Mock successful API response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          recipe: { title: 'Test Recipe' },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await analyzeFridge(mockFile);

      // Verify that error was logged and API key was not included
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to decode stored API key:',
        expect.any(Error)
      );

      const [[, { body }]] = (global.fetch as jest.Mock).mock.calls;
      const formData = body as FormData;
      expect(formData.get('apiKey')).toBeNull();

      consoleSpy.mockRestore();
    });

    test('handles network error when response.json() fails', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      // Mock failed response where response.json() throws
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await expect(analyzeFridge(mockFile)).rejects.toThrow('Network error');
    });

    test('handles network error fallback with different status codes', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      // Test multiple error scenarios
      const errorScenarios = [
        { status: 404, expectedError: 'Network error' },
        { status: 500, expectedError: 'Network error' },
        { status: 403, expectedError: 'Network error' },
      ];

      for (const scenario of errorScenarios) {
        const mockResponse = {
          ok: false,
          status: scenario.status,
          json: jest.fn().mockRejectedValue(new Error('Parse error')),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const { analyzeFridge } = await import('@/lib/api');

        await expect(analyzeFridge(mockFile)).rejects.toThrow(
          scenario.expectedError
        );
      }
    });

    test('handles 401 error with custom error message from server', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          error: 'Custom auth error from server',
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await expect(analyzeFridge(mockFile)).rejects.toThrow(
        'Custom auth error from server'
      );
    });

    test('handles 401 error with fallback message when no custom error', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await expect(analyzeFridge(mockFile)).rejects.toThrow(
        'Authentication failed. Please check your API key configuration.'
      );
    });

    test('handles non-401 errors with custom error messages', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          error: 'Bad request error',
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await expect(analyzeFridge(mockFile)).rejects.toThrow(
        'Bad request error'
      );
    });

    test('handles non-401 errors with HTTP status fallback', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockResponse = {
        ok: false,
        status: 503,
        json: jest.fn().mockResolvedValue({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { analyzeFridge } = await import('@/lib/api');

      await expect(analyzeFridge(mockFile)).rejects.toThrow('HTTP 503');
    });
  });
});
