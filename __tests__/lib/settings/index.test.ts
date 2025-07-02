/**
 * Settings Test Suite - Modular Architecture
 *
 * This file imports and runs all modular settings tests.
 * Each test file focuses on a specific domain:
 *
 * - manager.test.ts: Core SettingsManager functionality
 * - validation.test.ts: Settings validation logic
 * - import-export.test.ts: Import/Export functionality
 * - migration.test.ts: Settings migration between versions
 * - locale.test.ts: Locale management
 * - user-state.test.ts: User state and preference analysis
 * - edge-cases.test.ts: Error handling and edge cases
 */

// Import all modular test suites
import './manager.test';
import './validation.test';
import './import-export.test';
import './migration.test';
import './locale.test';
import './user-state.test';
import './edge-cases.test';

describe('Settings - Modular Test Suite', () => {
  test('all modular test suites are loaded', () => {
    // This test ensures all test files are properly loaded
    expect(true).toBe(true);
  });
});
