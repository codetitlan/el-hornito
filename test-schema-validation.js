// Test script to validate the enhanced schema validation
// Run this in the browser console on http://localhost:3001

async function testSchemaValidation() {
  console.log('🧪 Testing Enhanced Schema Validation\n');

  // Test 1: Valid request with all parameters
  console.log('Test 1: Valid request with userSettings...');
  try {
    const formData = new FormData();

    // Create a minimal test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    formData.append('image', blob, 'test.png');

    // Add valid userSettings
    const userSettings = {
      cookingPreferences: {
        cuisineTypes: ['italian', 'mexican'],
        dietaryRestrictions: ['vegetarian'],
        spiceLevel: 'medium',
        cookingTimePreference: 'quick',
        defaultServings: 4
      },
      kitchenEquipment: {
        basicAppliances: ['oven', 'stovetop'],
        cookware: ['pan', 'pot']
      }
    };

    formData.append('userSettings', JSON.stringify(userSettings));
    formData.append('preferences', 'I like healthy meals');
    formData.append('dietaryRestrictions', JSON.stringify(['vegetarian']));

    const response = await fetch('/api/analyze-fridge', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('✅ Valid request result:', response.status, result.success ? 'SUCCESS' : result.error);

  } catch (error) {
    console.error('❌ Valid request failed:', error);
  }

  // Test 2: Invalid request with malformed userSettings
  console.log('\nTest 2: Invalid userSettings format...');
  try {
    const formData = new FormData();

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob(async (blob) => {
      formData.append('image', blob, 'test.png');
      formData.append('userSettings', 'invalid-json');

      const response = await fetch('/api/analyze-fridge', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('✅ Invalid JSON handling:', response.status, result.error);
    }, 'image/png');

  } catch (error) {
    console.error('❌ Invalid request test failed:', error);
  }

  // Test 3: Request without image
  console.log('\nTest 3: Missing image file...');
  try {
    const formData = new FormData();
    formData.append('preferences', 'test');

    const response = await fetch('/api/analyze-fridge', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('✅ Missing image handling:', response.status, result.error);

  } catch (error) {
    console.error('❌ Missing image test failed:', error);
  }

  console.log('\n🎯 Schema validation tests completed!');
}

// Export for console use
window.testSchemaValidation = testSchemaValidation;
console.log('💡 Run window.testSchemaValidation() to test the enhanced validation');
