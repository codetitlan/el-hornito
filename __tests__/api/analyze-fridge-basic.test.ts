/**
 * Basic API Test Suite for /api/analyze-fridge
 * Starting with core functionality tests
 */

import { z } from 'zod';
import { testImages, expectedResponses } from '../helpers/test-data';

// Recipe validation schema (same as in route)
const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  cookingTime: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  servings: z.number(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  tips: z.array(z.string()).optional(),
});

describe('/api/analyze-fridge', () => {
  describe('Schema Validation (Bug Fix Verification)', () => {
    test('should accept English difficulty values', () => {
      const validRecipe = expectedResponses.validRecipe;
      expect(() => RecipeSchema.parse(validRecipe)).not.toThrow();
    });

    test('should reject Spanish difficulty values', () => {
      const invalidRecipe = {
        ...expectedResponses.validRecipe,
        difficulty: 'Fácil', // Spanish value that should fail
      };

      expect(() => RecipeSchema.parse(invalidRecipe)).toThrow(
        /Invalid enum value/
      );
    });

    test('should handle the exact error case from production logs', () => {
      const productionResponse = {
        title: 'Ensalada Asiática con Aderezo de Sésamo',
        description:
          'Una ensalada fresca y crujiente con vegetales variados y un aderezo asiático cremoso, perfecta para una comida ligera y saludable',
        cookingTime: '20 minutos',
        difficulty: 'Fácil', // This was causing the error
        servings: 4,
        ingredients: [
          '2 tazas de lechuga variada (visible en el cajón)',
          '1 pepino (visible en contenedor)',
        ],
        instructions: [
          'Paso 1: Lavar todos los vegetales cuidadosamente',
          'Paso 2: Cortar la lechuga en trozos manejables',
        ],
        tips: [
          'Puedes preparar el aderezo con anticipación y guardarlo en la nevera',
        ],
      };

      // This should throw a ZodError with the exact message from the logs
      expect(() => RecipeSchema.parse(productionResponse)).toThrow(
        /Invalid enum value/
      );
    });

    test('should accept corrected version with English difficulty', () => {
      const correctedResponse = {
        title: 'Ensalada Asiática con Aderezo de Sésamo',
        description:
          'Una ensalada fresca y crujiente con vegetales variados y un aderezo asiático cremoso, perfecta para una comida ligera y saludable',
        cookingTime: '20 minutos',
        difficulty: 'Easy', // Fixed to English value
        servings: 4,
        ingredients: [
          '2 tazas de lechuga variada (visible en el cajón)',
          '1 pepino (visible en contenedor)',
        ],
        instructions: [
          'Paso 1: Lavar todos los vegetales cuidadosamente',
          'Paso 2: Cortar la lechuga en trozos manejables',
        ],
        tips: [
          'Puedes preparar el aderezo con anticipación y guardarlo en la nevera',
        ],
      };

      expect(() => RecipeSchema.parse(correctedResponse)).not.toThrow();
    });
  });

  describe('Test Data Validation', () => {
    test('test images should have correct properties', () => {
      expect(testImages.validJPEG.type).toBe('image/jpeg');
      expect(testImages.validJPEG.size).toBeGreaterThan(0);
      expect(testImages.validPNG.type).toBe('image/png');
      expect(testImages.oversizedFile.size).toBeGreaterThan(5000000);
      expect(testImages.invalidType.type).toBe('text/plain');
    });

    test('expected responses should match schema', () => {
      expect(() =>
        RecipeSchema.parse(expectedResponses.validRecipe)
      ).not.toThrow();
      expect(() =>
        RecipeSchema.parse(expectedResponses.spanishRecipe)
      ).not.toThrow();
    });
  });
});
