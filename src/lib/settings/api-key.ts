/**
 * API Key Management Module - Pure functions for API key operations
 * Handles API key validation and related functionality
 */

/**
 * Validate API key with the backend
 */
export async function validateApiKey(key: string): Promise<boolean> {
  if (!key || key.trim().length === 0) {
    return false;
  }

  try {
    // Test the API key with a minimal request
    const response = await fetch('/api/validate-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: key }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
}

/**
 * Basic API key format validation (client-side)
 */
export function validateApiKeyFormat(key: string): {
  isValid: boolean;
  error?: string;
} {
  if (!key || key.trim().length === 0) {
    return { isValid: false, error: 'API key is required' };
  }

  // Basic format check for Anthropic API keys
  if (!key.startsWith('sk-ant-')) {
    return { isValid: false, error: 'Invalid API key format' };
  }

  if (key.length < 20) {
    return { isValid: false, error: 'API key is too short' };
  }

  return { isValid: true };
}
