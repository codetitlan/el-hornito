import { NextResponse } from 'next/server';
import { ENV } from '@/lib/constants';

export async function GET() {
  try {
    // Basic health checks
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
      apiKeyMode: ENV.ANTHROPIC_API_KEY ? 'shared' : 'personal-only',
      services: {
        api: 'operational',
        settings: 'operational',
      },
    };

    // Optional: Test critical dependencies
    // You could add database connectivity checks here if you had one

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
