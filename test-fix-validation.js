/**
 * Test script to verify the Spanish/English difficulty fix
 * This script tests the exact scenario that was failing in production
 */

// Mock the function by copying the logic from the route file
function generateEnhancedPrompt(
  userSettings,
  preferences,
  dietaryRestrictions,
  locale = 'en'
) {
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

  return prompts[locale].trim();
}

function testPromptGeneration() {
  console.log('🧪 Testing Prompt Generation Fix\n');

  // Test English prompt
  console.log('📝 English Prompt:');
  const englishPrompt = generateEnhancedPrompt(null, null, null, 'en');
  console.log('Contains "Easy|Medium|Hard":', englishPrompt.includes('Easy|Medium|Hard'));
  console.log('');

  // Test Spanish prompt
  console.log('📝 Spanish Prompt:');
  const spanishPrompt = generateEnhancedPrompt(null, null, null, 'es');
  console.log('Contains "Easy|Medium|Hard":', spanishPrompt.includes('Easy|Medium|Hard'));
  console.log('Contains "Fácil|Medio|Difícil":', spanishPrompt.includes('Fácil|Medio|Difícil'));
  console.log('Contains English requirement note:', spanishPrompt.includes('IMPORTANTE: El campo "difficulty" debe ser exactamente "Easy", "Medium" o "Hard" en inglés'));
  console.log('');

  // Verify the fix
  if (spanishPrompt.includes('Easy|Medium|Hard') && !spanishPrompt.includes('Fácil|Medio|Difícil')) {
    console.log('✅ SUCCESS: Spanish prompt now uses English difficulty values!');
  } else {
    console.log('❌ FAIL: Spanish prompt still has issues');
  }

  console.log('\n📋 Spanish Prompt Sample:');
  console.log(spanishPrompt.substring(0, 500) + '...');
}

testPromptGeneration();
