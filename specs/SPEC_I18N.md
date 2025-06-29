# Internationalization (i18n) Specification for El Hornito

## Overview

This specification defines the internationalization (i18n) system for El Hornito, an AI-powered fridge-to-recipe application. The system is designed to support multiple languages while initially implementing English-only to establish a solid foundation.

**Status**: 📋 **SPECIFICATION** - Ready for Implementation  
**Created**: June 28, 2025  
**Phase**: English-First Infrastructure Implementation

---

## Core Requirements

### 1. i18n Infrastructure

- **Framework Integration**: Next.js 15 App Router with `next-intl` library
- **TypeScript Support**: Full type safety for translation keys and messages
- **English-Only Initial**: Start with English as the only supported language
- **Future-Ready**: Architecture must easily support additional languages
- **Performance**: Minimal bundle size impact (<10% increase)

### 2. Translation System Architecture

- **Namespace Organization**: Logical grouping of translations by feature area
- **Key Structure**: Hierarchical key naming with dot notation
- **Type Safety**: TypeScript interfaces for all translation messages
- **Fallback Strategy**: Graceful fallbacks to prevent broken UI
- **Dynamic Loading**: Efficient loading of translation resources

### 3. User Experience Requirements

- **No Functionality Regression**: Existing features must work identically
- **Performance Parity**: No noticeable performance impact
- **Accessibility**: Maintain WCAG 2.1 AA compliance
- **Mobile Optimization**: Responsive design with translated content
- **Error Handling**: Translated error messages and notifications

---

## Technical Architecture

### 1. Directory Structure

```
src/
├── app/
│   ├── [locale]/              # Localized routes
│   │   ├── layout.tsx         # Locale-aware root layout
│   │   ├── page.tsx           # Localized home page
│   │   ├── settings/
│   │   │   └── page.tsx       # Localized settings page
│   │   └── loading.tsx        # Localized loading states
│   └── globals.css
├── components/
│   ├── providers/
│   │   └── IntlProvider.tsx   # Translation provider wrapper
│   └── ui/
│       └── LocaleSelector.tsx # Future language switcher
├── lib/
│   ├── i18n.ts               # i18n configuration
│   ├── get-dictionary.ts     # Translation loader utilities
│   └── constants.ts          # Updated to use translations
├── locales/
│   └── en/                   # English translations only
│       ├── common.json       # Shared UI elements
│       ├── settings.json     # Settings-specific text
│       ├── errors.json       # Error messages
│       ├── recipes.json      # Recipe-related text
│       └── navigation.json   # Navigation and layout
└── types/
    └── i18n.ts              # i18n-specific TypeScript types
```

### 2. Translation File Structure

#### Common UI Elements (`common.json`)

```json
{
  "app": {
    "title": "El Hornito - Fridge to Recipe AI",
    "tagline": "Transform your fridge contents into delicious recipes with AI",
    "description": "Upload a photo of your fridge and get personalized recipe suggestions instantly"
  },
  "actions": {
    "save": "Save",
    "saving": "Saving...",
    "saved": "Saved",
    "cancel": "Cancel",
    "reset": "Reset",
    "continue": "Continue",
    "back": "Back",
    "upload": "Upload",
    "download": "Download",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close"
  },
  "states": {
    "loading": "Loading...",
    "processing": "Processing...",
    "complete": "Complete",
    "failed": "Failed",
    "retry": "Try Again"
  }
}
```

#### Error Messages (`errors.json`)

```json
{
  "file": {
    "tooLarge": "File size must be less than 10MB",
    "invalidType": "Please upload a JPEG, PNG, or WebP image",
    "uploadFailed": "Upload failed. Please try again.",
    "processingFailed": "Failed to process image. Please try again."
  },
  "network": {
    "connectionError": "Network error. Please check your connection.",
    "timeout": "Request timed out. Please try again.",
    "serverError": "Server error. Please try again later."
  },
  "api": {
    "keyRequired": "API key required to generate recipes",
    "keyInvalid": "Invalid API key. Please check your configuration.",
    "rateLimited": "Too many requests. Please wait a moment and try again.",
    "quotaExceeded": "API quota exceeded. Please check your usage or upgrade your plan."
  },
  "analysis": {
    "noIngredients": "No ingredients detected in the image. Please try a different photo.",
    "analysisFailed": "Failed to analyze image. Please try again.",
    "recipeGenerationFailed": "Failed to generate recipe. Please try again."
  },
  "settings": {
    "saveFailed": "Failed to save settings. Please try again.",
    "loadFailed": "Failed to load settings.",
    "validationError": "Invalid settings data. Please check your inputs.",
    "importFailed": "Failed to import settings. Please check the file format."
  }
}
```

#### Settings (`settings.json`)

```json
{
  "page": {
    "title": "Settings",
    "subtitle": "Customize your cooking experience",
    "backToHome": "Back to Home",
    "unsavedChanges": "Unsaved changes",
    "saveChanges": "Save Changes",
    "allSaved": "All Saved",
    "resetToDefaults": "Reset to Defaults"
  },
  "privacy": {
    "title": "Privacy Notice",
    "localStorageInfo": "All settings are stored locally in your browser. No data is sent to our servers.",
    "dataControl": "You have full control over your data and can export or delete it at any time."
  },
  "apiConfiguration": {
    "title": "API Configuration",
    "personalKey": "Personal API Key",
    "keyPlaceholder": "Enter your Anthropic API key",
    "keyRequired": "API Key Required",
    "keyDescription": "Your personal Anthropic API key for generating recipes",
    "getApiKey": "Get API Key",
    "configureApiKey": "Configure API Key",
    "keyValidated": "API key validated successfully",
    "keyInvalid": "Invalid API key",
    "usageTracking": "Usage Tracking",
    "usageTrackingDescription": "Track API usage statistics (stored locally)"
  },
  "cookingPreferences": {
    "title": "Cooking Preferences",
    "cuisineTypes": {
      "label": "Favorite Cuisine Types",
      "description": "Select the types of cuisine you enjoy most",
      "maxSelections": "selected"
    },
    "dietaryRestrictions": {
      "label": "Dietary Restrictions",
      "description": "Let us know about any dietary needs or preferences"
    },
    "spiceLevel": {
      "label": "Spice Level",
      "description": "How spicy do you like your food?",
      "mild": "Mild",
      "medium": "Medium",
      "spicy": "Spicy",
      "verySpicy": "Very Spicy"
    },
    "cookingTime": {
      "label": "Cooking Time Preference",
      "description": "How much time do you usually have for cooking?",
      "quick": "Quick (≤30 min)",
      "moderate": "Moderate (30-60 min)",
      "elaborate": "Elaborate (60+ min)"
    },
    "servings": {
      "label": "Default Servings",
      "description": "How many people do you usually cook for?"
    },
    "mealTypes": {
      "label": "Preferred Meal Types",
      "description": "What types of meals do you like to prepare?"
    },
    "additionalNotes": {
      "label": "Additional Notes",
      "description": "Any other preferences or cooking notes",
      "placeholder": "e.g., prefer one-pot meals, avoid certain ingredients..."
    }
  },
  "kitchenEquipment": {
    "title": "Kitchen Equipment",
    "description": "Let us know what equipment you have available",
    "basicAppliances": "Basic Appliances",
    "advancedAppliances": "Advanced Appliances",
    "cookware": "Cookware",
    "bakingEquipment": "Baking Equipment",
    "other": "Other Equipment",
    "otherPlaceholder": "e.g., Pasta machine\nMandoline slicer\nImmersion blender",
    "summary": "Equipment Summary"
  },
  "dataManagement": {
    "title": "Data Management",
    "overview": "Settings Overview",
    "export": "Export Settings",
    "exportDescription": "Download your settings as a JSON file to backup or transfer to another device",
    "import": "Import Settings",
    "importDescription": "Upload a previously exported settings file",
    "importSuccess": "Settings imported successfully",
    "importError": "Failed to import settings",
    "clear": "Clear All Data",
    "clearDescription": "Permanently delete all your settings data. This action cannot be undone.",
    "clearConfirm": "Are you sure you want to clear all data?",
    "dangerZone": "Danger Zone",
    "lastUpdated": "Last Updated",
    "version": "Version",
    "totalItems": "items"
  }
}
```

#### Recipe Display (`recipes.json`)

```json
{
  "display": {
    "ingredients": "Ingredients",
    "instructions": "Instructions",
    "tips": "Chef's Tips",
    "difficulty": "Difficulty",
    "cookingTime": "Cooking Time",
    "servings": "servings",
    "share": "Share",
    "print": "Print",
    "startOver": "Start Over"
  },
  "difficulty": {
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard"
  },
  "actions": {
    "generateRecipe": "Generate Personalized Recipe",
    "analyzing": "Analyzing ingredients...",
    "generatingRecipe": "Generating recipe..."
  }
}
```

#### Navigation (`navigation.json`)

```json
{
  "main": {
    "home": "Home",
    "settings": "Settings"
  },
  "breadcrumbs": {
    "home": "Home",
    "settings": "Settings"
  }
}
```

### 3. TypeScript Integration

#### Global Type Definitions

```typescript
// src/types/i18n.ts
import type { AbstractIntlMessages } from 'next-intl';

// Type definitions for all translation namespaces
interface Messages extends AbstractIntlMessages {
  common: typeof import('../locales/en/common.json');
  errors: typeof import('../locales/en/errors.json');
  settings: typeof import('../locales/en/settings.json');
  recipes: typeof import('../locales/en/recipes.json');
  navigation: typeof import('../locales/en/navigation.json');
}

declare global {
  interface IntlMessages extends Messages {}
}

// Locale type definition
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
```

#### i18n Configuration

```typescript
// src/lib/i18n.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../locales/${locale}/common.json`)).default,
    // Additional message imports will be loaded per page/component
  };
});
```

### 4. Component Integration Patterns

#### Hook Usage Pattern

```typescript
// Standard pattern for component translation
import { useTranslations } from 'next-intl';

export function ExampleComponent() {
  const t = useTranslations('common');
  const tSettings = useTranslations('settings');
  const tErrors = useTranslations('errors');

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <button>{t('actions.save')}</button>
      {error && <p>{tErrors('file.uploadFailed')}</p>}
    </div>
  );
}
```

#### Server Component Pattern

```typescript
// For server components
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('common');

  return <h1>{t('app.title')}</h1>;
}
```

### 5. Constants File Migration

#### Before Migration

```typescript
// src/lib/constants.ts
export const APP_CONFIG = {
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'File size must be less than 10MB',
    INVALID_FILE_TYPE: 'Please upload a JPEG, PNG, or WebP image',
    // ... more hardcoded strings
  },
};
```

#### After Migration

```typescript
// src/lib/constants.ts - Updated to support i18n
export const APP_CONFIG = {
  // Keep non-translatable constants
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  API_TIMEOUT: 30000,

  // Remove hardcoded text - use translation keys instead
  // ERROR_MESSAGES will be accessed via useTranslations('errors')
} as const;

// Helper function for getting translated error messages
export const getErrorMessage = (
  key: string,
  t: (key: string) => string
): string => {
  return t(`errors.${key}`);
};
```

---

## Implementation Requirements

### 1. Phase 1: Foundation Setup

#### Required Dependencies

```json
{
  "dependencies": {
    "next-intl": "^3.0.0",
    "@formatjs/intl-localematcher": "^0.4.0"
  }
}
```

#### Folder Structure Creation

- Create `src/locales/en/` directory with all translation files
- Set up `src/components/providers/` for i18n provider
- Add `src/types/i18n.ts` for type definitions

#### Configuration Files

- Update `next.config.ts` with i18n configuration
- Create `src/lib/i18n.ts` configuration file
- Set up middleware for locale detection (future use)

### 2. Phase 2: Single Component Testing

#### Test Component Selection

- **Primary Target**: `ApiKeyRequiredBanner.tsx`
- **Reason**: Contains multiple text types (labels, descriptions, buttons)
- **Success Criteria**: Component functions identically with translation system

#### Testing Process

1. Extract all hardcoded strings to translation files
2. Implement translation hooks
3. Verify functionality parity
4. Test performance impact
5. Validate TypeScript integration

### 3. Phase 3: Systematic Migration

#### Constants Migration

- Extract all text from `APP_CONFIG.ERROR_MESSAGES`
- Move UI labels and descriptions to translation files
- Update all references throughout codebase

#### Component Migration Order

1. **Navigation and Layout** - Basic structure text
2. **Error Handling** - Error messages and notifications
3. **FridgeUploader** - Upload interface
4. **Settings Components** - All form labels and descriptions
5. **RecipeDisplay** - Recipe presentation text
6. **Banners and Notifications** - User guidance text

### 4. Quality Assurance Requirements

#### Functionality Testing

- [ ] All components render correctly with translations
- [ ] No functionality regression
- [ ] Error handling works properly
- [ ] Form validation messages display correctly

#### Performance Testing

- [ ] Bundle size increase <10%
- [ ] Load time impact <50ms
- [ ] No memory leaks with translation loading
- [ ] Responsive performance on mobile devices

#### Type Safety Validation

- [ ] All translation keys have TypeScript definitions
- [ ] No runtime errors for missing keys
- [ ] IDE autocomplete works for translation keys
- [ ] Build process catches invalid translation references

---

## Future Language Support

### 1. Architecture Readiness

The system must be designed to easily support additional languages:

#### Easy Language Addition

```typescript
// Simple change to add Spanish support
export const locales = ['en', 'es'] as const; // Add 'es'

// Corresponding translation files
locales/
├── en/
│   ├── common.json
│   └── ...
└── es/               # New Spanish translations
    ├── common.json
    └── ...
```

#### Settings Integration Ready

```typescript
// UserSettings interface prepared for locale preferences
interface UserSettings {
  // ... existing fields
  localePreferences?: {
    language: Locale;
    region?: string; // Future: 'en-US', 'en-GB'
    dateFormat?: string; // Future: locale-specific formatting
    numberFormat?: string;
  };
}
```

### 2. AI Content Localization Preparation

#### Claude Prompt Structure

```typescript
// Prepared for multi-language prompts
const getLocalizedPrompt = (locale: Locale, userSettings: UserSettings) => {
  const basePrompts = {
    en: 'Analyze this fridge photo and create a recipe...',
    // Future languages will be added here
  };

  return basePrompts[locale] + getUserPreferencesText(userSettings, locale);
};
```

---

## Success Criteria

### Technical Requirements

- ✅ **Zero Functionality Regression**: All existing features work identically
- ✅ **Type Safety**: 100% TypeScript coverage for translation keys
- ✅ **Performance**: <10% bundle size increase, <50ms load time impact
- ✅ **Coverage**: 100% of hardcoded text converted to translations
- ✅ **Maintainability**: Clear patterns for future development

### User Experience Requirements

- ✅ **Visual Consistency**: All text displays correctly across devices
- ✅ **Accessibility**: WCAG 2.1 AA compliance maintained
- ✅ **Mobile Experience**: Responsive design with translated content
- ✅ **Error Handling**: Meaningful error messages in translation system
- ✅ **Loading States**: Translated loading and status messages

### Development Requirements

- ✅ **Documentation**: Clear patterns and examples for team
- ✅ **Tooling**: IDE support for translation key autocomplete
- ✅ **Testing**: Comprehensive test coverage for i18n system
- ✅ **Build Process**: Translation validation in CI/CD pipeline
- ✅ **Future Ready**: Easy addition of new languages (target: <1 day setup)

---

## Validation Checklist

### Pre-Implementation

- [ ] Team review of specification completed
- [ ] Technology stack approved (next-intl)
- [ ] Directory structure planned
- [ ] Translation file structure designed
- [ ] TypeScript integration planned

### During Implementation

- [ ] Foundation setup complete
- [ ] Single component test successful
- [ ] Constants migration complete
- [ ] All components migrated
- [ ] Type safety validated

### Post-Implementation

- [ ] Functionality parity verified
- [ ] Performance benchmarks met
- [ ] Error handling tested
- [ ] Documentation complete
- [ ] Team training on patterns

---

## Risk Mitigation

### Identified Risks

1. **Performance Impact**

   - _Risk_: Translation system adds unnecessary overhead
   - _Mitigation_: English-only implementation minimizes impact; performance monitoring throughout

2. **Functionality Regression**

   - _Risk_: Breaking existing features during migration
   - _Mitigation_: Systematic testing; single component validation first

3. **Type Safety Issues**

   - _Risk_: Runtime errors from missing translation keys
   - _Mitigation_: Comprehensive TypeScript integration; build-time validation

4. **Maintenance Overhead**
   - _Risk_: Translation system adds complexity
   - _Mitigation_: Clear patterns; comprehensive documentation; team training

### Contingency Plans

- **Rollback Strategy**: Git-based rollback to pre-i18n state if critical issues
- **Gradual Implementation**: Component-by-component migration allows isolation of issues
- **Performance Monitoring**: Real-time monitoring to catch performance regressions early
- **Testing Strategy**: Comprehensive automated testing to catch regressions

---

**Document Status**: ✅ **SPECIFICATION COMPLETE**  
**Ready for Implementation**: Yes  
**Next Steps**: Create implementation plan and begin Phase 1  
**Last Updated**: June 28, 2025
