import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Create a minimal Anthropic client to test the key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Validate the key by listing models (doesn't consume tokens)
    try {
      await anthropic.models.list({
        limit: 1,
      });

      return NextResponse.json({ success: true });
    } catch (anthropicError: unknown) {
      console.error('Anthropic API validation error:', anthropicError);

      const error = anthropicError as { status?: number };

      if (error.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 400 }
        );
      }

      if (error.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded. API key is valid but over limit.',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to validate API key' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API key validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
