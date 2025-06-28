'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

// Functional component for error UI that can use hooks
function ErrorFallbackUI({
  error,
  errorInfo,
  onRetry,
  onGoHome,
}: {
  error: Error;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onGoHome: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {t('errorBoundary.title')}
        </h1>

        <p className="text-gray-600 mb-6">{t('errorBoundary.description')}</p>

        <div className="space-y-3">
          <Button
            onClick={onRetry}
            className="w-full"
            icon={<RefreshCw size={16} />}
          >
            {t('errorBoundary.tryAgainButton')}
          </Button>

          <Button
            onClick={onGoHome}
            variant="outline"
            className="w-full"
            icon={<Home size={16} />}
          >
            {t('errorBoundary.goHomeButton')}
          </Button>
        </div>

        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              {t('errorBoundary.errorDetailsTitle')}
            </summary>
            <div className="mt-2 p-3 bg-red-50 rounded text-xs font-mono text-red-800 overflow-auto max-h-40">
              <div className="font-semibold mb-2">Error:</div>
              <div className="mb-2">{error.toString()}</div>
              {errorInfo && (
                <>
                  <div className="font-semibold mb-2">Component Stack:</div>
                  <div>{errorInfo.componentStack}</div>
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI - use the functional component
      return (
        <ErrorFallbackUI
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);

    // In production, report to error service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Report to error service
      console.error('Production error:', { error, context });
    }

    // Show user-friendly message
    const message = getErrorMessage(error, context);
    return message;
  };

  return { handleError };
}

// Enhanced error message extraction
export function getErrorMessage(error: unknown, context?: string): string {
  if (error instanceof Error) {
    // API errors
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Anthropic API errors
    if (error.message.includes('API key')) {
      return 'Invalid API key. Please check your configuration in settings.';
    }

    if (error.message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (error.message.includes('quota')) {
      return 'API quota exceeded. Please check your usage or upgrade your plan.';
    }

    // File upload errors
    if (context === 'file-upload') {
      if (error.message.includes('size')) {
        return 'File is too large. Please choose a smaller image.';
      }
      if (error.message.includes('type')) {
        return 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
      }
    }

    // Settings errors
    if (context === 'settings') {
      if (error.message.includes('storage')) {
        return 'Unable to save settings. Please try again.';
      }
      if (error.message.includes('validation')) {
        return 'Invalid settings data. Please check your inputs.';
      }
    }

    // Return the original message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('TypeError')) {
      return error.message;
    }
  }

  // Generic fallback
  return context
    ? `An error occurred while ${context}. Please try again.`
    : 'An unexpected error occurred. Please try again.';
}
