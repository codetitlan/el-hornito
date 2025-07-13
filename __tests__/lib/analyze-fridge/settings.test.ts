// Unit tests for analyze-fridge settings - Pure functions, easy to test!
import {
  processUserSettings,
  extractLocale,
  processLegacyDietaryRestrictions,
  validateApiKeyFormat,
} from '@/lib/analyze-fridge/settings';

describe('analyze-fridge settings', () => {
  describe('processUserSettings', () => {
    it('should return null for no settings', () => {
      const result = processUserSettings(null);

      expect(result.userSettings).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('should parse valid JSON settings', () => {
      const settingsJson = JSON.stringify({
        cookingPreferences: {
          cuisineTypes: ['Italian'],
          spiceLevel: 'medium',
        },
      });

      const result = processUserSettings(settingsJson);

      expect(result.userSettings).toEqual({
        cookingPreferences: {
          cuisineTypes: ['Italian'],
          spiceLevel: 'medium',
        },
      });
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid JSON gracefully', () => {
      const result = processUserSettings('invalid-json');

      expect(result.userSettings).toBeNull();
      expect(result.error).toBe('Invalid user settings format');
    });

    it('should handle empty string', () => {
      const result = processUserSettings('');

      expect(result.userSettings).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });

  describe('extractLocale', () => {
    it('should return valid English locale', () => {
      expect(extractLocale('en')).toBe('en');
    });

    it('should return valid Spanish locale', () => {
      expect(extractLocale('es')).toBe('es');
    });

    it('should default to English for invalid locale', () => {
      expect(extractLocale('fr')).toBe('en');
      expect(extractLocale('invalid')).toBe('en');
      expect(extractLocale(null)).toBe('en');
    });
  });

  describe('processLegacyDietaryRestrictions', () => {
    it('should parse valid JSON array', () => {
      const result = processLegacyDietaryRestrictions(
        '["vegan", "gluten-free"]'
      );

      expect(result).toEqual(['vegan', 'gluten-free']);
    });

    it('should return empty array for null input', () => {
      const result = processLegacyDietaryRestrictions(null);

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON gracefully', () => {
      const result = processLegacyDietaryRestrictions('invalid-json');

      expect(result).toEqual([]);
    });

    it('should handle non-array JSON', () => {
      const result = processLegacyDietaryRestrictions('"not-an-array"');

      expect(result).toEqual([]);
    });

    it('should handle object instead of array', () => {
      const result = processLegacyDietaryRestrictions('{"key": "value"}');

      expect(result).toEqual([]);
    });
  });

  describe('validateApiKeyFormat', () => {
    it('should validate correct API key format', () => {
      const result = validateApiKeyFormat('sk-ant-api-03-abc123def456');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject null API key', () => {
      const result = validateApiKeyFormat(null);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No API key provided');
    });

    it('should reject invalid API key format', () => {
      const result = validateApiKeyFormat('invalid-key');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid API key format');
    });

    it('should reject API key with wrong prefix', () => {
      const result = validateApiKeyFormat('sk-openai-abc123');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid API key format');
    });

    it('should validate minimal valid key', () => {
      const result = validateApiKeyFormat('sk-ant-api');

      expect(result.isValid).toBe(true);
    });
  });
});
