import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ENV, APP_CONFIG } from '@/lib/constants';
import { getErrorMessage, retryOperation } from '@/lib/utils';
import { Recipe, AnalyzeFridgeResponse } from '@/types';

// Initialize default Anthropic client (fallback)
// Will be replaced by user-specific client if personal API key provided

// Enhanced request validation schema
const EnhancedAnalyzeRequestSchema = z.object({
  image: z.any(), // File object validation handled separately
  preferences: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  userSettings: z
    .object({
      cookingPreferences: z
        .object({
          cuisineTypes: z.array(z.string()).optional(),
          dietaryRestrictions: z.array(z.string()).optional(),
          spiceLevel: z
            .enum(['mild', 'medium', 'spicy', 'very-spicy'])
            .optional(),
          cookingTimePreference: z
            .enum(['quick', 'moderate', 'elaborate'])
            .optional(),
          mealTypes: z.array(z.string()).optional(),
          defaultServings: z.number().optional(),
          additionalNotes: z.string().optional(),
        })
        .optional(),
      kitchenEquipment: z
        .object({
          basicAppliances: z.array(z.string()).optional(),
          advancedAppliances: z.array(z.string()).optional(),
          cookware: z.array(z.string()).optional(),
          bakingEquipment: z.array(z.string()).optional(),
          other: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  apiKey: z.string().optional(),
});

// Recipe validation schema
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

// Generate enhanced prompt with user settings
function generateEnhancedPrompt(
  userSettings: {
    cookingPreferences?: {
      cuisineTypes?: string[];
      dietaryRestrictions?: string[];
      spiceLevel?: string;
      cookingTimePreference?: string;
      mealTypes?: string[];
      defaultServings?: number;
      additionalNotes?: string;
    };
    kitchenEquipment?: {
      basicAppliances?: string[];
      advancedAppliances?: string[];
      cookware?: string[];
      bakingEquipment?: string[];
      other?: string[];
    };
  } | null,
  preferences: string | null,
  dietaryRestrictions: string | null
): string {
  let prompt = `
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
- If ingredients are unclear, make reasonable assumptions`.trim();

  // Add user settings if available
  if (userSettings?.cookingPreferences) {
    const prefs = userSettings.cookingPreferences;

    prompt += '\n\nUser Preferences:';

    if (prefs.cuisineTypes && prefs.cuisineTypes.length > 0) {
      prompt += `\n- Preferred cuisines: ${prefs.cuisineTypes.join(', ')}`;
    }

    if (prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0) {
      prompt += `\n- Dietary restrictions: ${prefs.dietaryRestrictions.join(
        ', '
      )}`;
    }

    if (prefs.spiceLevel) {
      prompt += `\n- Spice level preference: ${prefs.spiceLevel}`;
    }

    if (prefs.cookingTimePreference) {
      const timePrefs = {
        quick: 'Quick meals (≤30 min)',
        moderate: 'Moderate cooking time (30-60 min)',
        elaborate: 'Elaborate recipes (60+ min)',
      };
      prompt += `\n- Cooking time preference: ${
        timePrefs[prefs.cookingTimePreference as keyof typeof timePrefs] ||
        prefs.cookingTimePreference
      }`;
    }

    if (prefs.mealTypes && prefs.mealTypes.length > 0) {
      prompt += `\n- Preferred meal types: ${prefs.mealTypes.join(', ')}`;
    }

    if (prefs.defaultServings) {
      prompt += `\n- Default servings: ${prefs.defaultServings}`;
    }

    if (prefs.additionalNotes) {
      prompt += `\n- Additional notes: ${prefs.additionalNotes}`;
    }
  }

  // Add kitchen equipment if available
  if (userSettings?.kitchenEquipment) {
    const equipment = userSettings.kitchenEquipment;
    const allEquipment = [
      ...(equipment.basicAppliances || []),
      ...(equipment.advancedAppliances || []),
      ...(equipment.cookware || []),
      ...(equipment.bakingEquipment || []),
      ...(equipment.other || []),
    ];

    if (allEquipment.length > 0) {
      prompt += `\n\nAvailable Kitchen Equipment: ${allEquipment.join(', ')}`;
      prompt +=
        '\n- Please suggest recipes that work with the available equipment';
      prompt += '\n- Avoid techniques requiring equipment not listed';
    }
  }

  // Legacy support for old preference format
  if (preferences) {
    prompt += `\n\nAdditional preferences: ${preferences}`;
  }

  if (dietaryRestrictions) {
    try {
      const restrictions = JSON.parse(dietaryRestrictions);
      if (restrictions.length > 0) {
        prompt += `\n\nLegacy dietary restrictions: ${restrictions.join(', ')}`;
      }
    } catch (error) {
      console.error('Error parsing legacy dietary restrictions:', error);
    }
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let personalApiKey: string | null = null;

  try {
    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const preferences = formData.get('preferences') as string | null;
    const dietaryRestrictions = formData.get('dietaryRestrictions') as
      | string
      | null;
    const userSettingsJson = formData.get('userSettings') as string | null;
    personalApiKey = formData.get('apiKey') as string | null;

    // Parse user settings if provided
    let userSettings = null;
    if (userSettingsJson) {
      try {
        userSettings = JSON.parse(userSettingsJson);
      } catch (error) {
        console.error('Failed to parse user settings:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid user settings format',
          } as AnalyzeFridgeResponse,
          { status: 400 }
        );
      }
    }

    // Prepare validation data for schema
    const validationData = {
      image: imageFile,
      preferences: preferences || undefined,
      dietaryRestrictions: dietaryRestrictions
        ? (() => {
            try {
              return JSON.parse(dietaryRestrictions);
            } catch {
              return undefined;
            }
          })()
        : undefined,
      userSettings: userSettings || undefined,
      apiKey: personalApiKey || undefined,
    };

    // Validate request structure using our schema
    try {
      EnhancedAnalyzeRequestSchema.parse(validationData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');

        return NextResponse.json(
          {
            success: false,
            error: `Request validation failed: ${errorMessages}`,
          } as AnalyzeFridgeResponse,
          { status: 400 }
        );
      }
    }

    // Determine which API key to use
    const apiKeyToUse = personalApiKey || ENV.ANTHROPIC_API_KEY;

    if (!apiKeyToUse) {
      console.error('No API key available - personalApiKey:', !!personalApiKey, 'ENV.ANTHROPIC_API_KEY:', !!ENV.ANTHROPIC_API_KEY);
      return NextResponse.json(
        {
          success: false,
          error: ENV.ANTHROPIC_API_KEY 
            ? 'API configuration error: No API key available'
            : 'Personal API key required. Please configure your Anthropic API key in settings.',
        } as AnalyzeFridgeResponse,
        { status: 401 }
      );
    }

    // Validate API key format
    if (!apiKeyToUse.startsWith('sk-ant-api')) {
      console.error('Invalid API key format:', apiKeyToUse.substring(0, 10) + '...');
      return NextResponse.json(
        {
          success: false,
          error: 'API configuration error: Invalid API key format',
        } as AnalyzeFridgeResponse,
        { status: 500 }
      );
    }

    // Create Anthropic client with appropriate API key
    let anthropicClient: Anthropic;
    try {
      anthropicClient = new Anthropic({
        apiKey: apiKeyToUse,
      });
    } catch (clientError) {
      console.error('Failed to create Anthropic client:', clientError);
      return NextResponse.json(
        {
          success: false,
          error: 'API configuration error: Failed to initialize client',
        } as AnalyzeFridgeResponse,
        { status: 500 }
      );
    }

    // Validate image file
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'No image file provided',
        } as AnalyzeFridgeResponse,
        { status: 400 }
      );
    }

    // Validate file size
    if (imageFile.size > APP_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: APP_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE,
        } as AnalyzeFridgeResponse,
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = APP_CONFIG.ALLOWED_FILE_TYPES as readonly string[];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: APP_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE,
        } as AnalyzeFridgeResponse,
        { status: 400 }
      );
    }

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Generate enhanced prompt with user settings
    const prompt = generateEnhancedPrompt(
      userSettings,
      preferences,
      dietaryRestrictions
    );

    console.log('Sending request to Claude API...');

    // Call Claude API with retry logic
    const claudeResponse = await retryOperation(async () => {
      const response = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageFile.type as
                    | 'image/jpeg'
                    | 'image/png'
                    | 'image/webp',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      return response;
    });

    console.log('Claude API response received');

    // Extract text content
    const textContent = claudeResponse.content.find(
      (block) => block.type === 'text'
    );

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    // Parse JSON response
    let recipe: Recipe;
    try {
      const cleanedText = textContent.text.trim();

      // Extract JSON from response (in case there's extra text)
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;

      const parsedRecipe = JSON.parse(jsonString);

      // Validate recipe structure
      recipe = RecipeSchema.parse(parsedRecipe);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.error('Raw response:', textContent.text);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate a valid recipe. Please try again.',
        } as AnalyzeFridgeResponse,
        { status: 500 }
      );
    }

    const processingTime = Date.now() - startTime;

    console.log(`Recipe generated successfully in ${processingTime}ms`);

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        recipe,
        processingTime,
      } as AnalyzeFridgeResponse,
      { status: 200 }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    console.error('API Error:', errorMessage);
    console.error('Full error:', error);

    // Handle specific Anthropic API errors
    if (error instanceof Error) {
      // Check for authentication errors (invalid API key)
      if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('authentication') || error.message.includes('invalid_api_key')) {
        return NextResponse.json(
          {
            success: false,
            error: personalApiKey 
              ? 'Invalid personal API key. Please check your Anthropic API key in settings.' 
              : 'Authentication failed. Please configure a valid API key.',
            processingTime,
          } as AnalyzeFridgeResponse,
          { status: 401 }
        );
      }

      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service is temporarily busy. Please try again in a moment.',
            processingTime,
          } as AnalyzeFridgeResponse,
          { status: 429 }
        );
      }

      if (error.message.includes('invalid_request')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid image format. Please upload a clear photo.',
            processingTime,
          } as AnalyzeFridgeResponse,
          { status: 400 }
        );
      }

      // Check for permission denied errors
      if (error.message.includes('403') || error.message.includes('forbidden')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access denied. Please check your API key permissions.',
            processingTime,
          } as AnalyzeFridgeResponse,
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: APP_CONFIG.ERROR_MESSAGES.API_ERROR,
        processingTime,
      } as AnalyzeFridgeResponse,
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
