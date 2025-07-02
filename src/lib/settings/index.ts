/**
 * Settings Module - Unified exports for all settings functionality
 * Maintains backward compatibility while providing modular architecture
 */

// Export the main manager (backward compatibility)
export { SettingsManager, settingsManager } from './manager';

// Export individual modules for granular testing and usage
export * from './storage';
export * from './validation';
export * from './migration';
export * from './import-export';
export * from './api-key';
export * from './locale';
export * from './user-state';

// Re-export types for convenience
export type { SupportedLocale } from './locale';
