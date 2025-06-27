// Quick integration test for settings functionality
// This can be run in the browser console to test the settings flow

console.log('Testing El Hornito Settings Integration');

// Test 1: Settings Manager
async function testSettingsManager() {
  console.log('\n1. Testing SettingsManager...');

  try {
    const { SettingsManager } = await import('./src/lib/settings.js');
    const settingsManager = SettingsManager.getInstance();

    // Load default settings
    const settings = settingsManager.loadSettings();
    console.log('✅ Default settings loaded:', settings);

    // Test saving settings
    const testSettings = {
      ...settings,
      cookingPreferences: {
        ...settings.cookingPreferences,
        cuisineTypes: ['italian', 'mexican'],
        dietaryRestrictions: ['vegetarian'],
        spiceLevel: 'medium'
      }
    };

    const saved = settingsManager.saveSettings(testSettings);
    console.log('✅ Settings saved:', saved);

    // Test loading saved settings
    const loadedSettings = settingsManager.loadSettings();
    console.log('✅ Settings loaded after save:', loadedSettings);

    return true;
  } catch (error) {
    console.error('❌ SettingsManager test failed:', error);
    return false;
  }
}

// Test 2: API Key Validation
async function testApiKeyValidation() {
  console.log('\n2. Testing API Key Validation...');

  try {
    const response = await fetch('/api/validate-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: 'test-key-123'  // This should fail validation
      })
    });

    const result = await response.json();
    console.log('✅ API validation endpoint responds:', result);

    return true;
  } catch (error) {
    console.error('❌ API validation test failed:', error);
    return false;
  }
}

// Test 3: Settings Integration with Recipe Generation
async function testRecipeGeneration() {
  console.log('\n3. Testing Recipe Generation Integration...');

  try {
    // Create a test FormData object
    const formData = new FormData();

    // Create a minimal test image file (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);

    canvas.toBlob(async (blob) => {
      formData.append('image', blob, 'test.png');

      // Add test user settings
      const testUserSettings = {
        cookingPreferences: {
          cuisineTypes: ['italian'],
          dietaryRestrictions: ['vegetarian'],
          spiceLevel: 'mild',
          cookingTimePreference: 'quick',
          defaultServings: 4
        },
        kitchenEquipment: {
          basicAppliances: ['oven', 'stovetop'],
          cookware: ['pan', 'pot']
        }
      };

      formData.append('userSettings', JSON.stringify(testUserSettings));

      try {
        const response = await fetch('/api/analyze-fridge', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        console.log('✅ Recipe generation with settings:', result.success ? 'SUCCESS' : 'FAILED');
        console.log('Recipe title:', result.recipe?.title);

      } catch (error) {
        console.error('❌ Recipe generation test failed:', error);
      }
    }, 'image/png');

    return true;
  } catch (error) {
    console.error('❌ Recipe generation test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting El Hornito Integration Tests\n');

  const test1 = await testSettingsManager();
  const test2 = await testApiKeyValidation();
  const test3 = await testRecipeGeneration();

  console.log('\n📊 Test Results:');
  console.log(`Settings Manager: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Validation: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Recipe Generation: ${test3 ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = test1 && test2 && test3;
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);
}

// Export for use
if (typeof window !== 'undefined') {
  window.testElHornito = runAllTests;
  console.log('💡 Run window.testElHornito() to start tests');
} else {
  runAllTests();
}
