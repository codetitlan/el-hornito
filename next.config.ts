import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Output standalone for Docker deployments with runtime env support
  output: 'standalone',

  // Webpack configuration for module resolution
  webpack: (config) => {
    // Ensure @ alias works correctly in all environments including Railway
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
    };

    // Ensure module resolution works in production
    config.resolve.modules = [
      path.resolve(__dirname, './src'),
      path.resolve(__dirname, './node_modules'),
      'node_modules',
    ];

    return config;
  },

  // Define serverRuntimeConfig for server-only runtime access
  serverRuntimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  },

  // Public runtime config (accessible on client - use sparingly)
  publicRuntimeConfig: {
    maxFileSize: process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760',
    allowedFormats:
      process.env.NEXT_PUBLIC_ALLOWED_FORMATS ||
      'image/jpeg,image/png,image/webp',
  },

  // Enable runtime environment variable access
  env: {
    // This allows the app to check for environment variables at runtime
    RUNTIME_ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
};

export default nextConfig;
