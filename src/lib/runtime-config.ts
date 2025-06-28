import getConfig from 'next/config';

// Get server and public runtime config
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig() || {};

// Runtime environment configuration
export const RUNTIME_ENV = {
  // Server-side only (secure)
  ANTHROPIC_API_KEY:
    serverRuntimeConfig?.anthropicApiKey || process.env.ANTHROPIC_API_KEY,

  // Public (safe to expose)
  MAX_FILE_SIZE: parseInt(
    publicRuntimeConfig?.maxFileSize ||
      process.env.NEXT_PUBLIC_MAX_FILE_SIZE ||
      '10485760'
  ),
  ALLOWED_FORMATS:
    publicRuntimeConfig?.allowedFormats ||
    process.env.NEXT_PUBLIC_ALLOWED_FORMATS ||
    'image/jpeg,image/png,image/webp',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Utility to check if we're using runtime vs build-time config
export const isUsingRuntimeConfig = () => {
  return !!(serverRuntimeConfig || publicRuntimeConfig);
};

// Enhanced environment utilities
export const getApiKeyStatus = () => {
  return {
    hasSharedKey: !!RUNTIME_ENV.ANTHROPIC_API_KEY,
    requiresPersonalKey: !RUNTIME_ENV.ANTHROPIC_API_KEY,
    mode: RUNTIME_ENV.ANTHROPIC_API_KEY ? 'shared' : 'personal-only',
    configSource: isUsingRuntimeConfig() ? 'runtime' : 'build-time',
  };
};

export const isPersonalApiKeyRequired = (): boolean => {
  return !RUNTIME_ENV.ANTHROPIC_API_KEY;
};
