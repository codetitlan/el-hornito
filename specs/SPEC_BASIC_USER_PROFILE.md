# Basic User Profile & Settings Specification

## Overview

This specification defines a local browser-based user settings system for El Hornito that allows users to customize their cooking experience and optionally provide their own API key. This serves as the foundation for future user authentication and profile management while keeping the current implementation simple and elegant.

---

## Core Requirements

### 1. User Settings Storage

- **Local Storage Only**: All settings stored in browser's localStorage
- **No Server Persistence**: Settings remain local until future user authentication
- **Privacy-First**: Clear messaging that data stays on user's device
- **Export/Import**: Allow users to backup and restore their settings

### 2. Settings Categories

#### A. Cooking Preferences

- **Cuisine Types**: Italian, Asian, Mexican, Mediterranean, etc.
- **Dietary Restrictions**: Vegetarian, Vegan, Gluten-free, Dairy-free, Keto, etc.
- **Spice Level**: Mild, Medium, Spicy, Very Spicy
- **Cooking Time Preference**: Quick (≤30 min), Moderate (30-60 min), Elaborate (60+ min)
- **Meal Types**: Breakfast, Lunch, Dinner, Snacks, Desserts
- **Serving Size Default**: 1-8 people

#### B. Kitchen Equipment

- **Basic Equipment**: Oven, Stovetop, Microwave, etc.
- **Advanced Equipment**: Air Fryer, Instant Pot, Blender, Food Processor, etc.
- **Cookware**: Non-stick pans, Cast iron, Wok, etc.
- **Baking Equipment**: Stand mixer, Baking sheets, etc.

#### C. API Configuration

- **Personal API Key**: Optional Anthropic Claude API key
- **API Key Validation**: Test connection before saving
- **Usage Tracking**: Show approximate costs/usage (if user provides key)
- **Fallback Option**: Use default service if no personal key

---

## User Interface Design

### 1. Settings Page (`/settings`)

#### Layout Structure

```
Header (El Hornito branding + Save/Reset buttons)
├── Privacy Notice Section
├── API Configuration Section
├── Cooking Preferences Section
├── Kitchen Equipment Section
└── Data Management Section (Export/Import/Reset)
```

#### Privacy Notice

- Prominent notice explaining local storage
- No data collection or server transmission
- Option to clear all data
- Future migration path explanation

### 2. Settings Access

- **Header Link**: "Settings" link in main navigation
- **Onboarding**: Optional settings tour for new users
- **Quick Access**: Settings shortcut in upload flow

### 3. Mobile-First Design

- Collapsible sections for mobile
- Touch-friendly toggles and selections
- Responsive grid layout for equipment selection

---

## Technical Implementation

### 1. Data Models

```typescript
interface UserSettings {
  version: string; // For future migrations
  lastUpdated: string;
  cookingPreferences: CookingPreferences;
  kitchenEquipment: KitchenEquipment;
  apiConfiguration: ApiConfiguration;
}

interface CookingPreferences {
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  spiceLevel: 'mild' | 'medium' | 'spicy' | 'very-spicy';
  cookingTimePreference: 'quick' | 'moderate' | 'elaborate';
  mealTypes: string[];
  defaultServings: number;
  additionalNotes?: string;
}

interface KitchenEquipment {
  basicAppliances: string[];
  advancedAppliances: string[];
  cookware: string[];
  bakingEquipment: string[];
  other: string[];
}

interface ApiConfiguration {
  hasPersonalKey: boolean;
  keyValidated: boolean;
  usageTracking: boolean;
  lastValidation?: string;
}
```

### 2. Storage Management

```typescript
class SettingsManager {
  // Load settings from localStorage
  loadSettings(): UserSettings;

  // Save settings to localStorage
  saveSettings(settings: UserSettings): void;

  // Validate API key
  validateApiKey(key: string): Promise<boolean>;

  // Export settings as JSON
  exportSettings(): string;

  // Import settings from JSON
  importSettings(data: string): UserSettings;

  // Clear all settings
  clearSettings(): void;
}
```

### 3. API Integration

#### Enhanced API Endpoint

```typescript
// Extend existing /api/analyze-fridge endpoint
interface AnalyzeFridgeRequest {
  image: File;
  userSettings?: {
    cookingPreferences?: CookingPreferences;
    kitchenEquipment?: KitchenEquipment;
  };
  apiKey?: string; // User's personal API key
}
```

#### Claude Prompt Enhancement

```typescript
const enhancedPrompt = `
Analyze this fridge photo and create a recipe considering:

User Preferences:
${
  userSettings.cookingPreferences
    ? `
- Cuisine types: ${userSettings.cookingPreferences.cuisineTypes.join(', ')}
- Dietary restrictions: ${userSettings.cookingPreferences.dietaryRestrictions.join(
        ', '
      )}
- Spice level: ${userSettings.cookingPreferences.spiceLevel}
- Cooking time: ${userSettings.cookingPreferences.cookingTimePreference}
- Serves: ${userSettings.cookingPreferences.defaultServings}
`
    : ''
}

Available Equipment:
${
  userSettings.kitchenEquipment
    ? `
- Appliances: ${userSettings.kitchenEquipment.basicAppliances
        .concat(userSettings.kitchenEquipment.advancedAppliances)
        .join(', ')}
- Cookware: ${userSettings.kitchenEquipment.cookware.join(', ')}
`
    : ''
}

Please create a recipe that works with the available equipment and matches the user's preferences.
`;
```

---

## User Experience Flow

### 1. First-Time User

1. **Optional Onboarding**: Quick setup tour highlighting key settings
2. **Progressive Disclosure**: Start with basic preferences, expand to advanced
3. **Immediate Value**: Show how settings improve recipe suggestions

### 2. Settings Configuration

1. **Privacy First**: Clear notice about local storage
2. **Smart Defaults**: Pre-select common preferences
3. **Visual Feedback**: Immediate preview of how settings affect recipes
4. **Validation**: Real-time validation for API keys

### 3. Recipe Generation

1. **Settings Integration**: Automatically include saved preferences
2. **Override Options**: Allow temporary changes without saving
3. **Feedback Loop**: Show how settings influenced the recipe

---

## Component Structure

### 1. Settings Page Components

```
/settings/page.tsx
├── SettingsHeader
├── PrivacyNotice
├── ApiConfigurationSection
├── CookingPreferencesSection
├── KitchenEquipmentSection
└── DataManagementSection
```

### 2. Reusable Components

```
/components/settings/
├── SettingsToggle
├── SettingsSelect
├── EquipmentGrid
├── PreferenceChips
└── ApiKeyInput
```

---

## Privacy & Security

### 1. Data Protection

- **Local Only**: No server transmission of personal settings
- **Encryption**: Optional encryption for sensitive data (API keys)
- **Clear Policies**: Transparent about data usage
- **User Control**: Easy data deletion and export

### 2. API Key Security

- **Secure Storage**: Encrypt API keys in localStorage
- **Validation Only**: Test keys without storing full responses
- **User Education**: Clear guidance on API key safety
- **Revocation**: Easy key removal and replacement

---

## Success Metrics

### 1. User Engagement

- **Settings Adoption**: % of users who configure settings
- **Recipe Improvement**: User satisfaction with personalized recipes
- **Retention**: Users returning with saved preferences

### 2. Technical Performance

- **Load Time**: Settings page loads < 1 second
- **Storage Efficiency**: Minimal localStorage usage
- **API Integration**: Successful preference application > 95%

---

## Future Evolution Path

### 1. User Authentication Phase

- **Account Creation**: Migrate local settings to user accounts
- **Cloud Sync**: Settings sync across devices
- **Advanced Features**: Recipe favorites, cooking history

### 2. Enhanced Personalization

- **Learning Algorithm**: Improve suggestions based on user feedback
- **Recipe Collections**: Curated recipe sets based on preferences
- **Social Features**: Share settings and recipes with others

---

## Implementation Notes

### 1. Backward Compatibility

- **Version Management**: Handle settings schema updates
- **Graceful Fallbacks**: Work without settings configured
- **Migration Path**: Smooth transition to future user accounts

### 2. Performance Considerations

- **Lazy Loading**: Load settings only when needed
- **Caching**: Cache validated API keys (with security)
- **Minimal Impact**: Settings shouldn't slow down recipe generation

---

This specification provides a solid foundation for user customization while maintaining the simplicity and elegance of the current application. The local storage approach allows immediate value while preparing for future user authentication and advanced features.
