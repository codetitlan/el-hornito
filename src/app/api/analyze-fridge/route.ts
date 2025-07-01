import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils';
import { AnalyzeFridgeResponse } from '@/types';
import {
  analyzeUserFridge,
  classifyAnalysisError,
  validateFileInput,
} from '@/lib/analyze-fridge/core';
import { createDefaultDependencies } from '@/lib/analyze-fridge/dependencies';
import {
  processUserSettings,
  extractLocale,
} from '@/lib/analyze-fridge/settings';
import { AnalyzeFridgeInput } from '@/lib/analyze-fridge/types';

// Initialize default Anthropic client (fallback)
// Will be replaced by user-specific client if personal API key provided

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let personalApiKey: string | null = null;

  try {
    // 1. HTTP concerns - Extract form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const preferences = formData.get('preferences') as string | null;
    const dietaryRestrictions = formData.get('dietaryRestrictions') as
      | string
      | null;
    const locale = extractLocale(formData.get('locale') as string | null);
    const userSettingsJson = formData.get('userSettings') as string | null;
    personalApiKey = formData.get('apiKey') as string | null;

    // 2. Basic input validation
    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'No image file provided',
        } as AnalyzeFridgeResponse,
        { status: 400 }
      );
    }

    // 2.1. Validate file input (size, type, etc.)
    const fileValidation = validateFileInput([imageFile]);
    if (!fileValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: fileValidation.error,
        } as AnalyzeFridgeResponse,
        { status: 400 }
      );
    }

    // 3. Process user settings
    const settingsResult = processUserSettings(userSettingsJson);
    if (settingsResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: settingsResult.error,
        } as AnalyzeFridgeResponse,
        { status: 400 }
      );
    }

    // 4. Create business logic input
    const input: AnalyzeFridgeInput = {
      files: [imageFile],
      userSettings: settingsResult.userSettings,
      preferences,
      dietaryRestrictions,
      locale,
      apiKey: personalApiKey,
    };

    // 5. Create dependencies
    const dependencies = createDefaultDependencies(personalApiKey);

    // 6. Call extracted business logic
    const result = await analyzeUserFridge(input, dependencies);

    // 7. HTTP response
    return NextResponse.json(
      {
        success: true,
        recipe: result.recipe,
        processingTime: result.processingTime,
      } as AnalyzeFridgeResponse,
      { status: 200 }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    console.error('API Error:', errorMessage);
    console.error('Full error:', error);

    // Use extracted error classification
    const errorClass = classifyAnalysisError(error as Error);

    // Handle specific error types for better user experience
    if (errorClass.isAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: personalApiKey
            ? 'Invalid personal API key. Please check your Anthropic API key in settings.'
            : 'Authentication failed. Please configure a valid API key.',
          processingTime,
        } as AnalyzeFridgeResponse,
        { status: errorClass.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorClass.message,
        processingTime,
      } as AnalyzeFridgeResponse,
      { status: errorClass.status }
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
