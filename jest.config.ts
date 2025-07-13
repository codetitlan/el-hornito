import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Only run actual test files
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  // API testing specific configuration - focus on actively tested files
  collectCoverageFrom: [
    'src/lib/utils.ts', // Utility functions
    'src/app/api/**/route.ts', // API routes
    'src/lib/api.ts', // API utilities
    'src/lib/settings.ts', // Settings utilities
    '!src/**/*.d.ts',
  ],
  // Coverage thresholds for comprehensively tested utilities
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Test environment overrides
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
