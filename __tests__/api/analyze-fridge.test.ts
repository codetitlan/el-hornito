import { z } from 'zod';

// Import the RecipeSchema from the route file
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

describe('Recipe Schema Validation', () => {
  test('should accept English difficulty values', () => {
    const validRecipe = {
      title: 'Test Recipe',
      description: 'A test recipe',
      cookingTime: '30 minutes',
      difficulty: 'Easy',
      servings: 4,
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2'],
      tips: ['tip 1'],
    };

    expect(() => RecipeSchema.parse(validRecipe)).not.toThrow();
  });

  test('should reject Spanish difficulty values', () => {
    const invalidRecipe = {
      title: 'Test Recipe',
      description: 'A test recipe',
      cookingTime: '30 minutes',
      difficulty: 'Fácil', // Spanish value that should fail
      servings: 4,
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2'],
      tips: ['tip 1'],
    };

    expect(() => RecipeSchema.parse(invalidRecipe)).toThrow();
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
        '2 zanahorias (visible en cajón)',
        '4 tomates cherry (visibles en contenedor)',
        '1 pimiento verde (visible en cajón)',
        'Para el aderezo:',
        '3 cucharadas de yogur natural (visible Danone)',
        '2 cucharadas de leche (visible)',
        '1 cucharadita de sésamo',
        '1 cucharada de salsa de soya baja en sodio',
        '1 pizca de pimienta',
      ],
      instructions: [
        'Paso 1: Lavar todos los vegetales cuidadosamente',
        'Paso 2: Cortar la lechuga en trozos manejables',
        'Paso 3: Cortar el pepino en rodajas finas',
        'Paso 4: Rallar las zanahorias',
        'Paso 5: Cortar los tomates cherry por la mitad',
        'Paso 6: Cortar el pimiento verde en tiras finas',
        'Paso 7: Para el aderezo, mezclar en un bowl el yogur, leche, sésamo y salsa de soya',
        'Paso 8: Combinar todos los vegetales en un bowl grande',
        'Paso 9: Agregar el aderezo justo antes de servir y mezclar bien',
      ],
      tips: [
        'Puedes preparar el aderezo con anticipación y guardarlo en la nevera',
        'Para mayor frescura, mantén los vegetales y el aderezo separados hasta el momento de servir',
        'Si quieres más proteína, puedes agregar tofu o pollo cocido',
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
