// Pure prompt generation functions for analyze-fridge
import { UserSettings } from './types';

// Generate enhanced prompt with user settings - Pure function, easy to test
export function generateEnhancedPrompt(
  userSettings: UserSettings | null,
  preferences: string | null,
  dietaryRestrictions: string | null,
  locale: 'en' | 'es' = 'en'
): string {
  // Base prompts by language
  const prompts = {
    en: `
Analyze this fridge photo and identify all visible ingredients. Based on the available ingredients, suggest ONE complete recipe that can be made primarily with these ingredients.

Please respond in this exact JSON format:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "cookingTime": "30 minutes",
  "difficulty": "Easy|Medium|Hard",
  "servings": 4,
  "ingredients": [
    "2 cups flour",
    "1 egg",
    "..."
  ],
  "instructions": [
    "Step 1: ...",
    "Step 2: ...",
    "..."
  ],
  "tips": ["Optional cooking tip 1", "..."]
}

Requirements:
- Use primarily ingredients visible in the photo
- Provide clear, step-by-step instructions
- Include realistic cooking times
- Make the recipe practical and achievable
- If ingredients are unclear, make reasonable assumptions`,
    es: `
Analiza esta foto de nevera e identifica todos los ingredientes visibles. Basándote en los ingredientes disponibles, sugiere UNA receta completa que se pueda hacer principalmente con estos ingredientes.

Por favor responde en este formato JSON exacto:
{
  "title": "Nombre de la Receta",
  "description": "Breve descripción del plato",
  "cookingTime": "30 minutos",
  "difficulty": "Easy|Medium|Hard",
  "servings": 4,
  "ingredients": [
    "2 tazas de harina",
    "1 huevo",
    "..."
  ],
  "instructions": [
    "Paso 1: ...",
    "Paso 2: ...",
    "..."
  ],
  "tips": ["Consejo de cocina opcional 1", "..."]
}

Requisitos:
- Usa principalmente los ingredientes visibles en la foto
- Proporciona instrucciones claras paso a paso
- Incluye tiempos de cocción realistas
- Haz que la receta sea práctica y realizable
- Si los ingredientes no están claros, haz suposiciones razonables
- IMPORTANTE: El campo "difficulty" debe ser exactamente "Easy", "Medium" o "Hard" en inglés`,
  };

  let prompt = prompts[locale].trim();

  // Add user settings if available
  if (userSettings?.cookingPreferences) {
    prompt += buildCookingPreferencesSection(
      userSettings.cookingPreferences,
      locale
    );
  }

  // Add kitchen equipment if available
  if (userSettings?.kitchenEquipment) {
    prompt += buildKitchenEquipmentSection(
      userSettings.kitchenEquipment,
      locale
    );
  }

  // Legacy support for old preference format
  if (preferences) {
    const labels = {
      en: 'Additional preferences',
      es: 'Preferencias adicionales',
    };
    prompt += `\n\n${labels[locale]}: ${preferences}`;
  }

  if (dietaryRestrictions) {
    try {
      const restrictions = JSON.parse(dietaryRestrictions);
      if (restrictions.length > 0) {
        const labels = {
          en: 'Legacy dietary restrictions',
          es: 'Restricciones dietéticas heredadas',
        };
        prompt += `\n\n${labels[locale]}: ${restrictions.join(', ')}`;
      }
    } catch (error) {
      console.error('Error parsing legacy dietary restrictions:', error);
    }
  }

  return prompt;
}

// Build cooking preferences section - Pure function
export function buildCookingPreferencesSection(
  prefs: NonNullable<UserSettings['cookingPreferences']>,
  locale: 'en' | 'es'
): string {
  // Localized headings
  const headings = {
    en: 'User Preferences:',
    es: 'Preferencias del Usuario:',
  };

  let section = `\n\n${headings[locale]}`;

  if (prefs.cuisineTypes && prefs.cuisineTypes.length > 0) {
    const labels = {
      en: 'Preferred cuisines',
      es: 'Cocinas preferidas',
    };
    section += `\n- ${labels[locale]}: ${prefs.cuisineTypes.join(', ')}`;
  }

  if (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0) {
    const labels = {
      en: 'Dietary restrictions',
      es: 'Restricciones dietéticas',
    };
    section += `\n- ${labels[locale]}: ${prefs.dietaryRestrictions.join(', ')}`;
  }

  if (prefs.spiceLevel) {
    const labels = {
      en: 'Spice level preference',
      es: 'Preferencia de nivel de picante',
    };
    section += `\n- ${labels[locale]}: ${prefs.spiceLevel}`;
  }

  if (prefs.cookingTimePreference) {
    const timePrefs = {
      en: {
        quick: 'Quick meals (≤30 min)',
        moderate: 'Moderate cooking time (30-60 min)',
        elaborate: 'Elaborate recipes (60+ min)',
      },
      es: {
        quick: 'Comidas rápidas (≤30 min)',
        moderate: 'Tiempo de cocción moderado (30-60 min)',
        elaborate: 'Recetas elaboradas (60+ min)',
      },
    };
    const labels = {
      en: 'Cooking time preference',
      es: 'Preferencia de tiempo de cocción',
    };
    const timeLabel =
      timePrefs[locale][
        prefs.cookingTimePreference as keyof typeof timePrefs.en
      ] || prefs.cookingTimePreference;
    section += `\n- ${labels[locale]}: ${timeLabel}`;
  }

  if (prefs.mealTypes && prefs.mealTypes.length > 0) {
    const labels = {
      en: 'Preferred meal types',
      es: 'Tipos de comida preferidos',
    };
    section += `\n- ${labels[locale]}: ${prefs.mealTypes.join(', ')}`;
  }

  if (prefs.defaultServings) {
    const labels = {
      en: 'Default servings',
      es: 'Porciones predeterminadas',
    };
    section += `\n- ${labels[locale]}: ${prefs.defaultServings}`;
  }

  if (prefs.additionalNotes) {
    const labels = {
      en: 'Additional notes',
      es: 'Notas adicionales',
    };
    section += `\n- ${labels[locale]}: ${prefs.additionalNotes}`;
  }

  return section;
}

// Build kitchen equipment section - Pure function
export function buildKitchenEquipmentSection(
  equipment: NonNullable<UserSettings['kitchenEquipment']>,
  locale: 'en' | 'es'
): string {
  const allEquipment = [
    ...(equipment.basicAppliances || []),
    ...(equipment.advancedAppliances || []),
    ...(equipment.cookware || []),
    ...(equipment.bakingEquipment || []),
    ...(equipment.other || []),
  ];

  if (allEquipment.length === 0) {
    return '';
  }

  const labels = {
    en: {
      header: 'Available Kitchen Equipment',
      suggest: 'Please suggest recipes that work with the available equipment',
      avoid: 'Avoid techniques requiring equipment not listed',
    },
    es: {
      header: 'Equipos de Cocina Disponibles',
      suggest:
        'Por favor sugiere recetas que funcionen con el equipo disponible',
      avoid: 'Evita técnicas que requieran equipo no listado',
    },
  };

  let section = `\n\n${labels[locale].header}: ${allEquipment.join(', ')}`;
  section += `\n- ${labels[locale].suggest}`;
  section += `\n- ${labels[locale].avoid}`;

  return section;
}
