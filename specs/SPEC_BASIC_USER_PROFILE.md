# Basic User Profile & Settings Specification

## Overview

This specification defines a local browser-based user settings system for El Hornito that allows users to customize their cooking experience and provide their own API key. The system supports both shared environment API keys and user-provided personal API keys, with graceful fallbacks when no shared key is available.

**Status**: ✅ **IMPLEMENTED AND PRODUCTION-READY** (June 27, 2025)

---

## Core Requirements

### 1. User Settings Storage

- **Local Storage Only**: All settings stored in browser's localStorage ✅
- **No Server Persistence**: Settings remain local until future user authentication ✅
- **Privacy-First**: Clear messaging that data stays on user's device ✅
- **Export/Import**: Allow users to backup and restore their settings ✅

### 2. API Key Management System

#### A. Flexible API Key Configuration

- **Environment Variable (Optional)**: `ANTHROPIC_API_KEY` can be set for shared usage
- **Personal API Keys**: Users can provide their own Anthropic API keys
- **Graceful Fallback**: When no environment key exists, users must provide personal keys
- **Secure Storage**: Personal API keys are base64 encoded in localStorage
- **Real-time Validation**: API keys are validated before storage

#### B. User Experience for API Keys

- **API Key Required Banner**: Prominent notification when personal key needed
- **Smart Detection**: Automatically detects if environment key is available
- **Clear Messaging**: Users understand when and why they need personal keys
- **Easy Configuration**: Direct links to Anthropic Console and settings page

### 3. Settings Categories

#### A. Cooking Preferences ✅

- **Cuisine Types**: Italian, Asian, Mexican, Mediterranean, etc.
- **Dietary Restrictions**: Vegetarian, Vegan, Gluten-free, Dairy-free, Keto, etc.
- **Spice Level**: Mild, Medium, Spicy, Very Spicy
- **Cooking Time Preference**: Quick (≤30 min), Moderate (30-60 min), Elaborate (60+ min)
- **Meal Types**: Breakfast, Lunch, Dinner, Snacks, Desserts
- **Serving Size Default**: 1-8 people

#### B. Kitchen Equipment ✅

- **Basic Equipment**: Oven, Stovetop, Microwave, etc.
- **Advanced Equipment**: Air Fryer, Instant Pot, Blender, Food Processor, etc.
- **Cookware**: Non-stick pans, Cast iron, Wok, etc.
- **Baking Equipment**: Stand mixer, Baking sheets, etc.

#### C. API Configuration ✅

- **Personal API Key**: Anthropic Claude API key (required when no environment key)
- **API Key Validation**: Real-time validation with Anthropic API ✅
- **Secure Storage**: Base64 encoded storage in localStorage ✅
- **Usage Information**: Clear messaging about API key requirements ✅

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

## Current Implementation Status (June 27, 2025)

### ✅ **FULLY IMPLEMENTED FEATURES**

#### 1. **Complete Settings System**

- **Settings Page**: `/settings` with full functionality
- **Settings Manager**: Singleton class handling all operations
- **Data Persistence**: localStorage with migration support
- **Import/Export**: JSON-based backup and restore

#### 2. **User Interface Components**

- **SettingsToggle**: Reusable boolean controls
- **SettingsSelect**: Enhanced dropdown selectors
- **PreferenceChips**: Multi-select chip interface
- **EquipmentGrid**: Visual equipment selection
- **CookingPreferencesSection**: Complete preference management
- **KitchenEquipmentSection**: Equipment configuration
- **DataManagementSection**: Export/import/reset functionality
- **ApiConfigurationSection**: API key management with validation

#### 3. **Enhanced User Experience**

- **OnboardingBanner**: Smart new user guidance
- **ApiKeyRequiredBanner**: API key requirement notification ✨ **NEW**
- **ErrorBoundary**: Comprehensive error handling
- **Settings Preview**: Integration with recipe generation flow
- **Visual Feedback**: Change indicators and animations

#### 4. **API Integration & Key Management**

- **Flexible API Key System**: Environment + Personal key support ✨ **NEW**
- **Enhanced API Endpoint**: Settings-aware recipe generation
- **Personal API Key Support**: User-provided keys with validation ✨ **NEW**
- **Graceful Fallbacks**: Works with or without environment keys ✨ **NEW**
- **Secure Storage**: Base64 encoded API keys ✨ **NEW**

#### 5. **Production Ready Features**

- **Zero TypeScript Errors**: Full type safety
- **Zero ESLint Errors**: Code quality compliance
- **Successful Production Build**: Ready for deployment
- **Mobile Responsive**: Works on all devices
- **Error Resilient**: Comprehensive error handling

### 🔄 **API KEY MANAGEMENT SYSTEM** ✨ **NEW FEATURE**

#### Architecture

```typescript
// Environment Detection
const isPersonalApiKeyRequired = (): boolean => !ENV.ANTHROPIC_API_KEY;

// API Key Utilities
const hasPersonalApiKey = (): boolean => !!localStorage.getItem('elhornito-api-key');
const getPersonalApiKey = (): string | null => /* secure retrieval */;

// Deployment Modes
- **Shared Key Mode**: ANTHROPIC_API_KEY set → optional personal keys
- **Personal Only Mode**: No ANTHROPIC_API_KEY → personal keys required
```

#### User Experience Flow

1. **API Key Detection**: System checks for environment key availability
2. **Smart Notifications**: ApiKeyRequiredBanner shows when needed
3. **Clear Messaging**: Users understand requirements and next steps
4. **Easy Configuration**: Direct paths to API key setup
5. **Graceful Errors**: Helpful error messages for authentication issues

### 📊 **COMPONENT INVENTORY**

#### Settings Components (8 total)

- `ApiConfigurationSection.tsx` - API key management ✅
- `CookingPreferencesSection.tsx` - Preference configuration ✅
- `DataManagementSection.tsx` - Import/export/reset ✅
- `EquipmentGrid.tsx` - Visual equipment selection ✅
- `KitchenEquipmentSection.tsx` - Equipment management ✅
- `PreferenceChips.tsx` - Multi-select chips ✅
- `SettingsSelect.tsx` - Enhanced dropdowns ✅
- `SettingsToggle.tsx` - Boolean controls ✅

#### User Experience Components (3 total)

- `OnboardingBanner.tsx` - New user guidance ✅
- `ApiKeyRequiredBanner.tsx` - API key notifications ✨ **NEW**
- `ErrorBoundary.tsx` - Error handling ✅

#### Core Utilities (2 total)

- `SettingsManager` class - Settings operations ✅
- API client with key management - Enhanced ✨ **UPDATED**

### 🎯 **READY FOR PRODUCTION**

The system is now **production-ready** with the following deployment options:

#### Option 1: With Shared API Key

```bash
ANTHROPIC_API_KEY=sk-ant-api... # Shared key available
# Users can optionally provide personal keys for usage control
```

#### Option 2: Personal Keys Only

```bash
# No ANTHROPIC_API_KEY environment variable
# Users must configure personal API keys to use the app
# Clear UX guidance provided throughout
```

Both deployment modes are fully supported with appropriate user guidance and error handling.

---

## Implementation Changelog

### June 27, 2025 - Major Enhancement: Flexible API Key Management

#### 🆕 **New Features Added**

- **ApiKeyRequiredBanner Component**: Smart notification system for API key requirements
- **Flexible Environment Support**: Optional `ANTHROPIC_API_KEY` environment variable
- **Personal API Key Detection**: Automatic detection and secure retrieval from localStorage
- **Enhanced Error Handling**: Specific authentication error messages with guidance

#### 🔧 **Enhanced Components**

- **API Client (`src/lib/api.ts`)**: Added `hasPersonalApiKey()` and `getPersonalApiKey()` utilities
- **API Route (`src/app/api/analyze-fridge/route.ts`)**: Improved error handling and validation
- **Constants (`src/lib/constants.ts`)**: Optional environment validation with logging
- **Main Page (`src/app/page.tsx`)**: Integrated ApiKeyRequiredBanner

#### 🚀 **Production Impact**

- **Deployment Flexibility**: Can deploy with or without shared API keys
- **User Experience**: Clear guidance when personal API keys are needed
- **Security**: Support for personal-key-only deployments
- **Backward Compatibility**: Existing shared-key deployments continue working

#### 📁 **Files Modified**

```
src/lib/constants.ts         - Made ANTHROPIC_API_KEY optional
src/lib/api.ts              - Added personal API key utilities
src/app/api/analyze-fridge/route.ts - Enhanced error handling
src/app/page.tsx            - Added ApiKeyRequiredBanner
src/components/ApiKeyRequiredBanner.tsx - NEW COMPONENT
```

#### ✅ **Validation Results**

- **Build Status**: ✅ Successful production build
- **TypeScript**: ✅ Zero errors
- **ESLint**: ✅ Zero warnings
- **Testing**: ✅ Both deployment modes validated

---

_This specification serves as the definitive documentation for the El Hornito user settings and API key management system, updated in real-time as features are implemented and enhanced._
