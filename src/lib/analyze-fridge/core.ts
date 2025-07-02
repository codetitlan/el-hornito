// Core business logic for analyze-fridge - Pure functions for easy testing
import { z } from 'zod';
import { APP_CONFIG } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';
import { Recipe } from '@/types';
import {
  AnalyzeFridgeInput,
  AnalyzeFridgeResult,
  AnalyzeFridgeDependencies,
} from './types';
import { generateEnhancedPrompt } from './prompts';
import { validateApiKeyFormat, processUserSettings } from './settings';

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

// Validate file input - Pure function
export function validateFileInput(files: File[]): {
  isValid: boolean;
  error?: string;
} {
  if (!files.length) {
    return {
      isValid: false,
      error: 'No image file provided',
    };
  }

  const file = files[0];

  // Validate file size
  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: APP_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  // Validate file type
  const allowedTypes = APP_CONFIG.ALLOWED_FILE_TYPES as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: APP_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  return { isValid: true };
}

// Convert file to base64 - Pure function (async)
export async function fileToBase64(file: File): Promise<string> {
  const imageBuffer = await file.arrayBuffer();
  return Buffer.from(imageBuffer).toString('base64');
}

// Parse and validate recipe from Claude response - Pure function
export function parseRecipeFromResponse(responseText: string): {
  recipe?: Recipe;
  error?: string;
} {
  try {
    const cleanedText = responseText.trim();

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;

    const parsedRecipe = JSON.parse(jsonString);

    // Validate recipe structure
    const recipe = RecipeSchema.parse(parsedRecipe);
    return { recipe };
  } catch (parseError) {
    console.error('Failed to parse Claude response:', parseError);
    console.error('Raw response:', responseText);

    return {
      error: 'Failed to generate a valid recipe. Please try again.',
    };
  }
}

// Create Anthropic message parameters - Pure function
export function createAnthropicMessageParams(
  prompt: string,
  base64Image: string,
  fileType: string
) {
  return {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user' as const,
        content: [
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: fileType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: base64Image,
            },
          },
          {
            type: 'text' as const,
            text: prompt,
          },
        ],
      },
    ],
  };
}

// Main business logic function - Testable with dependency injection
export async function analyzeUserFridge(
  input: AnalyzeFridgeInput,
  dependencies: AnalyzeFridgeDependencies
): Promise<AnalyzeFridgeResult> {
  const startTime = Date.now();

  try {
    // Validate file input (defensive programming)
    const fileValidation = validateFileInput(input.files);
    if (!fileValidation.isValid) {
      throw new Error(fileValidation.error);
    }

    // Process user settings
    const settingsResult = processUserSettings(
      input.userSettings ? JSON.stringify(input.userSettings) : null
    );
    if (settingsResult.error) {
      throw new Error(settingsResult.error);
    }

    // Validate API key
    const apiKey = dependencies.getApiKey();
    const keyValidation = validateApiKeyFormat(apiKey);
    if (!keyValidation.isValid) {
      throw new Error(keyValidation.error);
    }

    // Convert image to base64
    const file = input.files[0];
    const base64Image = await fileToBase64(file);

    // Generate prompt
    const prompt = generateEnhancedPrompt(
      settingsResult.userSettings,
      input.preferences,
      input.dietaryRestrictions,
      input.locale
    );

    // Create message parameters
    const messageParams = createAnthropicMessageParams(
      prompt,
      base64Image,
      file.type
    );

    console.log('Sending request to Claude API...');

    // Call Claude API with retry logic
    const claudeResponse = await dependencies.retryOperation(async () => {
      return await dependencies.anthropicClient.messages.create(messageParams);
    });

    console.log('Claude API response received');

    // Extract text content
    const responseData = claudeResponse as {
      content?: Array<{ type: string; text?: string }>;
    };
    const textContent = responseData.content?.find(
      (block) => block.type === 'text'
    );

    if (!textContent || textContent.type !== 'text' || !textContent.text) {
      throw new Error('No text content in Claude response');
    }

    // Parse recipe
    const recipeResult = parseRecipeFromResponse(textContent.text);
    if (recipeResult.error || !recipeResult.recipe) {
      throw new Error(recipeResult.error || 'Failed to parse recipe');
    }

    const processingTime = Date.now() - startTime;

    console.log(`Recipe generated successfully in ${processingTime}ms`);

    return {
      recipe: recipeResult.recipe,
      processingTime,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    console.error('API Error:', errorMessage);
    console.error('Full error:', error);

    // Enhance error for better debugging
    const enhancedError = new Error(errorMessage);
    Object.assign(enhancedError, { processingTime });
    throw enhancedError;
  }
}

// Error classification for different response codes - Pure function
export function classifyAnalysisError(error: Error): {
  status: number;
  message: string;
  isAuthError?: boolean;
  isRateLimit?: boolean;
} {
  const errorMessage = error.message.toLowerCase();

  // Check for authentication errors
  if (
    errorMessage.includes('401') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('invalid_api_key') ||
    errorMessage.includes('no api key available')
  ) {
    return {
      status: 401,
      message:
        'Invalid API key. Please check your Anthropic API key in settings.',
      isAuthError: true,
    };
  }

  // Check for rate limiting
  if (errorMessage.includes('rate_limit')) {
    return {
      status: 429,
      message: 'Service is temporarily busy. Please try again in a moment.',
      isRateLimit: true,
    };
  }

  // Check for invalid request
  if (errorMessage.includes('invalid_request')) {
    return {
      status: 400,
      message: 'Invalid image format. Please upload a clear photo.',
    };
  }

  // Check for permission errors
  if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
    return {
      status: 403,
      message: 'Access denied. Please check your API key permissions.',
    };
  }

  // Default to 500 for other errors
  return {
    status: 500,
    message: APP_CONFIG.ERROR_MESSAGES.API_ERROR,
  };
}
