// Debug script to test personal API key functionality
const { createDefaultDependencies } = require('./src/lib/analyze-fridge/dependencies.ts');

console.log('Testing personal API key functionality...');

// Test 1: Personal API key provided, no environment key
try {
  delete process.env.ANTHROPIC_API_KEY;
  const deps = createDefaultDependencies('sk-ant-api03-test-personal-key');
  console.log('✅ Test 1 PASSED: Personal API key works when no environment key');
  console.log('API Key used:', deps.getApiKey());
} catch (error) {
  console.log('❌ Test 1 FAILED:', error.message);
}

// Test 2: No personal API key, no environment key
try {
  delete process.env.ANTHROPIC_API_KEY;
  const deps = createDefaultDependencies(null);
  console.log('❌ Test 2 UNEXPECTED: Should have thrown error');
} catch (error) {
  console.log('✅ Test 2 PASSED: Correctly throws error when no API key available');
  console.log('Error:', error.message);
}

// Test 3: Both personal and environment key available (should prefer personal)
try {
  process.env.ANTHROPIC_API_KEY = 'sk-ant-env-key';
  const deps = createDefaultDependencies('sk-ant-personal-key');
  console.log('✅ Test 3 PASSED: Both keys available');
  console.log('API Key used:', deps.getApiKey());
  console.log('Should be personal key (sk-ant-personal-key):', deps.getApiKey() === 'sk-ant-personal-key');
} catch (error) {
  console.log('❌ Test 3 FAILED:', error.message);
}
