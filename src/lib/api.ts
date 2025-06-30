// API client utilities for frontend components
import { AnalyzeFridgeResponse, Recipe, UserSettings } from '@/types';
import { getErrorMessage } from '@/lib/utils';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onStatusUpdate?: (status: string) => void;
}

// Check if user has a personal API key configured
export const hasPersonalApiKey = (): boolean => {
  if (typeof window === 'undefined') return false;
  const storedApiKey = localStorage.getItem('elhornito-api-key');
  return !!storedApiKey;
};

// Get the personal API key if available
const getPersonalApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  const storedApiKey = localStorage.getItem('elhornito-api-key');
  if (!storedApiKey) return null;

  try {
    return atob(storedApiKey);
  } catch (error) {
    console.error('Failed to decode stored API key:', error);
    return null;
  }
};

const analyzeImage = async (
  file: File,
  userSettings?: UserSettings,
  locale: 'en' | 'es' = 'en',
  options?: UploadOptions
): Promise<Recipe> => {
  const { onProgress, onStatusUpdate } = options || {};

  try {
    onStatusUpdate?.('Preparing image...');
    onProgress?.(10);

    // Check if we have a personal API key available
    const personalApiKey = getPersonalApiKey();

    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    formData.append('locale', locale);

    if (userSettings) {
      formData.append('userSettings', JSON.stringify(userSettings));
    }

    // Add personal API key if available
    if (personalApiKey) {
      formData.append('apiKey', personalApiKey);
    }

    onStatusUpdate?.('Uploading to server...');
    onProgress?.(30);

    // Make API request
    const response = await fetch('/api/analyze-fridge', {
      method: 'POST',
      body: formData,
    });

    onStatusUpdate?.('Analyzing ingredients...');
    onProgress?.(60);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Network error' }));

      // Handle specific API key related errors
      if (response.status === 401) {
        throw new Error(
          errorData.error ||
            'Authentication failed. Please check your API key configuration.'
        );
      }

      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    onStatusUpdate?.('Generating recipe...');
    onProgress?.(90);

    const data: AnalyzeFridgeResponse = await response.json();

    if (!data.success || !data.recipe) {
      throw new Error(data.error || 'Failed to generate recipe');
    }

    onStatusUpdate?.('Complete!');
    onProgress?.(100);

    return data.recipe;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Mock recipe for development/testing
const mockRecipes = {
  en: {
    title: 'Mediterranean Vegetable Pasta',
    description:
      'A fresh and healthy pasta dish with vegetables from your fridge',
    cookingTime: '25 minutes',
    difficulty: 'Easy' as const,
    servings: 4,
    ingredients: [
      '400g pasta (any shape)',
      '2 tomatoes, diced',
      '1 bell pepper, sliced',
      '1 onion, chopped',
      '3 cloves garlic, minced',
      '200g spinach',
      '100g cheese, grated',
      '3 tbsp olive oil',
      'Salt and pepper to taste',
      'Fresh herbs (basil or oregano)',
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook pasta according to package directions.',
      'Heat olive oil in a large pan over medium heat.',
      'Add onion and garlic, cook until fragrant (2-3 minutes).',
      'Add bell pepper and cook for 5 minutes until softened.',
      'Add diced tomatoes and cook for 5 minutes.',
      'Add spinach and cook until wilted.',
      'Drain pasta and add to the vegetable mixture.',
      'Toss everything together, season with salt and pepper.',
      'Serve hot topped with grated cheese and fresh herbs.',
    ],
    tips: [
      'Use any vegetables you have available in your fridge',
      'Add protein like chicken or beans for a more filling meal',
      'Save some pasta water to adjust consistency if needed',
    ],
  },
  es: {
    title: 'Pasta Mediterránea con Verduras',
    description:
      'Un plato de pasta fresco y saludable con las verduras de tu nevera',
    cookingTime: '25 minutos',
    difficulty: 'Easy' as const,
    servings: 4,
    ingredients: [
      '400g de pasta (cualquier forma)',
      '2 tomates, cortados en dados',
      '1 pimiento, en rodajas',
      '1 cebolla, picada',
      '3 dientes de ajo, picados',
      '200g de espinacas',
      '100g de queso, rallado',
      '3 cucharadas de aceite de oliva',
      'Sal y pimienta al gusto',
      'Hierbas frescas (albahaca u orégano)',
    ],
    instructions: [
      'Pon una olla grande de agua salada a hervir y cocina la pasta según las instrucciones del paquete.',
      'Calienta el aceite de oliva en una sartén grande a fuego medio.',
      'Añade la cebolla y el ajo, cocina hasta que estén aromáticos (2-3 minutos).',
      'Añade el pimiento y cocina por 5 minutos hasta que se ablande.',
      'Añade los tomates cortados y cocina por 5 minutos.',
      'Añade las espinacas y cocina hasta que se marchiten.',
      'Escurre la pasta y añádela a la mezcla de verduras.',
      'Mezcla todo junto, sazona con sal y pimienta.',
      'Sirve caliente cubierto con queso rallado y hierbas frescas.',
    ],
    tips: [
      'Usa cualquier verdura que tengas disponible en tu nevera',
      'Añade proteína como pollo o frijoles para una comida más abundante',
      'Guarda un poco del agua de la pasta para ajustar la consistencia si es necesario',
    ],
  },
};

// Development mode API that returns mock data
const analyzeFridgeMock = async (
  file: File,
  userSettings?: UserSettings,
  locale: 'en' | 'es' = 'en',
  options?: UploadOptions
): Promise<Recipe> => {
  const { onProgress, onStatusUpdate } = options || {};

  // Simulate API delay and progress
  const steps = [
    { message: 'Preparing image...', progress: 10, delay: 300 },
    { message: 'Uploading to server...', progress: 30, delay: 500 },
    { message: 'Analyzing ingredients...', progress: 60, delay: 1000 },
    { message: 'Generating recipe...', progress: 90, delay: 800 },
    { message: 'Complete!', progress: 100, delay: 200 },
  ];

  for (const step of steps) {
    onStatusUpdate?.(step.message);
    onProgress?.(step.progress);
    await new Promise((resolve) => setTimeout(resolve, step.delay));
  }

  // Customize mock recipe based on user settings and locale
  let customizedRecipe = { ...mockRecipes[locale] };

  if (userSettings?.cookingPreferences.cuisineTypes.includes('vegetarian')) {
    const vegetarianTitles = {
      en: 'Vegetarian Garden Pasta',
      es: 'Pasta Vegetariana del Huerto',
    };
    const vegetarianDescriptions = {
      en: 'A delicious vegetarian pasta made with fresh garden vegetables',
      es: 'Una deliciosa pasta vegetariana hecha con verduras frescas del huerto',
    };
    customizedRecipe = {
      ...customizedRecipe,
      title: vegetarianTitles[locale],
      description: vegetarianDescriptions[locale],
    };
  }

  if (
    userSettings?.cookingPreferences.dietaryRestrictions.includes('gluten-free')
  ) {
    const glutenFreeLabels = {
      en: 'gluten-free pasta',
      es: 'pasta sin gluten',
    };
    customizedRecipe = {
      ...customizedRecipe,
      ingredients: customizedRecipe.ingredients.map((ingredient: string) =>
        ingredient.includes('pasta') || ingredient.includes('pasta')
          ? glutenFreeLabels[locale]
          : ingredient
      ),
    };
  }

  return customizedRecipe;
};

// Choose API function based on environment and API key availability
export const analyzeFridge = (() => {
  // Check if we have an environment API key at runtime
  const hasEnvApiKey = !!process.env.ANTHROPIC_API_KEY;

  // In development without environment API key, use mock
  if (process.env.NODE_ENV === 'development' && !hasEnvApiKey) {
    console.log(
      '🔧 Using mock API in development mode - no ANTHROPIC_API_KEY found'
    );
    return analyzeFridgeMock;
  }

  // In all other cases (production or development with API key), use real API
  // The real API will handle personal API key fallback if environment key is missing
  console.log(
    `🚀 Using real API - Environment key: ${
      hasEnvApiKey ? 'Available' : 'Not available'
    }`
  );
  return analyzeImage;
})();
