/**
 * Settings Module - Backward compatibility export
 * Re-exports from the new modular settings architecture
 */

// Re-export everything from the new modular structure
export * from './settings';

// Ensure backward compatibility for the main exports
export { SettingsManager, settingsManager } from './settings';
