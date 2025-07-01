// Unit tests for analyze-fridge prompts - Pure functions, easy to test!
import {
  generateEnhancedPrompt,
  buildCookingPreferencesSection,
  buildKitchenEquipmentSection,
} from '@/lib/analyze-fridge/prompts';
import { UserSettings } from '@/lib/analyze-fridge/types';

describe('analyze-fridge prompts', () => {
  describe('generateEnhancedPrompt', () => {
    it('should generate basic English prompt', () => {
      const prompt = generateEnhancedPrompt(null, null, null, 'en');

      expect(prompt).toContain('Analyze this fridge photo');
      expect(prompt).toContain('suggest ONE complete recipe');
      expect(prompt).toContain('"title": "Recipe Name"');
      expect(prompt).toContain('Use primarily ingredients visible');
    });

    it('should generate basic Spanish prompt', () => {
      const prompt = generateEnhancedPrompt(null, null, null, 'es');

      expect(prompt).toContain('Analiza esta foto de nevera');
      expect(prompt).toContain('sugiere UNA receta completa');
      expect(prompt).toContain('"title": "Nombre de la Receta"');
      expect(prompt).toContain('Usa principalmente los ingredientes');
    });

    it('should include cooking preferences when provided', () => {
      const userSettings: UserSettings = {
        cookingPreferences: {
          cuisineTypes: ['Italian', 'Mexican'],
          dietaryRestrictions: ['vegetarian'],
          spiceLevel: 'medium',
        },
      };

      const prompt = generateEnhancedPrompt(userSettings, null, null, 'en');

      expect(prompt).toContain('User Preferences:');
      expect(prompt).toContain('Preferred cuisines: Italian, Mexican');
      expect(prompt).toContain('Dietary restrictions: vegetarian');
      expect(prompt).toContain('Spice level preference: medium');
    });

    it('should include kitchen equipment when provided', () => {
      const userSettings: UserSettings = {
        kitchenEquipment: {
          basicAppliances: ['microwave', 'toaster'],
          cookware: ['pan', 'pot'],
        },
      };

      const prompt = generateEnhancedPrompt(userSettings, null, null, 'en');

      expect(prompt).toContain(
        'Available Kitchen Equipment: microwave, toaster, pan, pot'
      );
      expect(prompt).toContain(
        'suggest recipes that work with the available equipment'
      );
    });

    it('should include legacy preferences', () => {
      const prompt = generateEnhancedPrompt(null, 'gluten-free', null, 'en');

      expect(prompt).toContain('Additional preferences: gluten-free');
    });

    it('should parse legacy dietary restrictions', () => {
      const prompt = generateEnhancedPrompt(
        null,
        null,
        '["vegan", "nut-free"]',
        'en'
      );

      expect(prompt).toContain('Legacy dietary restrictions: vegan, nut-free');
    });

    it('should handle invalid JSON in dietary restrictions gracefully', () => {
      const prompt = generateEnhancedPrompt(null, null, 'invalid-json', 'en');

      // Should not throw and should not include invalid content
      expect(prompt).toContain('Analyze this fridge photo');
      expect(prompt).not.toContain('Legacy dietary restrictions');
    });
  });

  describe('buildCookingPreferencesSection', () => {
    it('should build complete preferences section in English', () => {
      const prefs = {
        cuisineTypes: ['Asian', 'Mediterranean'],
        dietaryRestrictions: ['gluten-free'],
        spiceLevel: 'spicy' as const,
        cookingTimePreference: 'quick' as const,
        mealTypes: ['breakfast', 'lunch'],
        defaultServings: 4,
        additionalNotes: 'No seafood please',
      };

      const section = buildCookingPreferencesSection(prefs, 'en');

      expect(section).toContain('User Preferences:');
      expect(section).toContain('Preferred cuisines: Asian, Mediterranean');
      expect(section).toContain('Dietary restrictions: gluten-free');
      expect(section).toContain('Spice level preference: spicy');
      expect(section).toContain(
        'Cooking time preference: Quick meals (≤30 min)'
      );
      expect(section).toContain('Preferred meal types: breakfast, lunch');
      expect(section).toContain('Default servings: 4');
      expect(section).toContain('Additional notes: No seafood please');
    });

    it('should build preferences section in Spanish', () => {
      const prefs = {
        cuisineTypes: ['Italiana'],
        spiceLevel: 'mild' as const,
      };

      const section = buildCookingPreferencesSection(prefs, 'es');

      expect(section).toContain('Preferencias del Usuario:');
      expect(section).toContain('Cocinas preferidas: Italiana');
      expect(section).toContain('Preferencia de nivel de picante: mild');
    });

    it('should handle empty preferences object', () => {
      const section = buildCookingPreferencesSection({}, 'en');

      expect(section).toBe('\n\nUser Preferences:');
    });
  });

  describe('buildKitchenEquipmentSection', () => {
    it('should build equipment section with all categories', () => {
      const equipment = {
        basicAppliances: ['microwave'],
        advancedAppliances: ['stand mixer'],
        cookware: ['cast iron pan'],
        bakingEquipment: ['cake pan'],
        other: ['mortar and pestle'],
      };

      const section = buildKitchenEquipmentSection(equipment, 'en');

      expect(section).toContain(
        'Available Kitchen Equipment: microwave, stand mixer, cast iron pan, cake pan, mortar and pestle'
      );
      expect(section).toContain(
        'suggest recipes that work with the available equipment'
      );
      expect(section).toContain(
        'Avoid techniques requiring equipment not listed'
      );
    });

    it('should build equipment section in Spanish', () => {
      const equipment = {
        basicAppliances: ['horno'],
      };

      const section = buildKitchenEquipmentSection(equipment, 'es');

      expect(section).toContain('Equipos de Cocina Disponibles: horno');
      expect(section).toContain(
        'sugiere recetas que funcionen con el equipo disponible'
      );
    });

    it('should return empty string for no equipment', () => {
      const section = buildKitchenEquipmentSection({}, 'en');

      expect(section).toBe('');
    });

    it('should handle undefined arrays', () => {
      const equipment = {
        basicAppliances: undefined,
        cookware: ['pan'],
      };

      const section = buildKitchenEquipmentSection(equipment, 'en');

      expect(section).toContain('Available Kitchen Equipment: pan');
    });
  });
});
