import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ENV, CLAUDE_PROMPT_TEMPLATE, APP_CONFIG } from '@/lib/constants';
import { getErrorMessage, retryOperation } from '@/lib/utils';
import { Recipe, AnalyzeFridgeResponse } from '@/types';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: ENV.ANTHROPIC_API_KEY!,
});

// Request validation schema
const AnalyzeRequestSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  preferences: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate environment
    if (!ENV.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY');
      return NextResponse.json(
        {
          success: false,
          error: 'API configuration error',
        } as AnalyzeFridgeResponse,
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const preferences = formData.get('preferences') as string | null;
    const dietaryRestrictions = formData.get('dietaryRestrictions') as
      | string
      | null;

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

    // Prepare prompt with user preferences
    let prompt = CLAUDE_PROMPT_TEMPLATE;

    if (preferences) {
      prompt += `\n\nUser preferences: ${preferences}`;
    }

    if (dietaryRestrictions) {
      const restrictions = JSON.parse(dietaryRestrictions);
      if (restrictions.length > 0) {
        prompt += `\n\nDietary restrictions: ${restrictions.join(', ')}`;
      }
    }

    console.log('Sending request to Claude API...');

    // Call Claude API with retry logic
    const claudeResponse = await retryOperation(async () => {
      const response = await anthropic.messages.create({
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
