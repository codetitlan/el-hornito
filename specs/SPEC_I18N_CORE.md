# Internationalization (i18n) Core Specification

## Overview

Core i18n infrastructure for El Hornito with English-only implementation to establish foundation for future language support.

**Status**: 📋 **CORE SPECIFICATION** - Foundation Phase  
**Created**: June 28, 2025  
**Approach**: English-First, Keep It Simple

---

## Core Requirements

### 1. Technology Stack

- **Framework**: Next.js 15 App Router + `next-intl`
- **Language**: English only initially
- **TypeScript**: Full type safety for translation keys
- **Performance**: <5% bundle size increase

### 2. Directory Structure

```
src/
├── app/[locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── settings/page.tsx
├── locales/en/
│   ├── common.json
│   ├── errors.json
│   └── settings.json
└── lib/i18n.ts
```

### 3. Translation Files

#### `common.json`

```json
{
  "app": {
    "title": "El Hornito - Fridge to Recipe AI"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "reset": "Reset"
  },
  "navigation": {
    "home": "Home",
    "settings": "Settings"
  }
}
```

#### `errors.json`

```json
{
  "file": {
    "tooLarge": "File size must be less than 10MB",
    "invalidType": "Please upload a JPEG, PNG, or WebP image"
  },
  "api": {
    "keyRequired": "API key required",
    "keyInvalid": "Invalid API key"
  },
  "network": {
    "connectionError": "Network error. Please check your connection."
  }
}
```

#### `settings.json`

```json
{
  "page": {
    "title": "Settings",
    "subtitle": "Customize your cooking experience"
  },
  "cookingPreferences": {
    "title": "Cooking Preferences",
    "cuisineTypes": "Favorite Cuisine Types",
    "dietaryRestrictions": "Dietary Restrictions"
  },
  "apiConfiguration": {
    "title": "API Configuration",
    "personalKey": "Personal API Key"
  }
}
```

---

## Implementation Approach

### Phase 1: Foundation (Week 1-2)

1. **Setup Infrastructure**

   - Install `next-intl`
   - Create translation files
   - Set up TypeScript types

2. **Test on Single Component**
   - Choose `ApiKeyRequiredBanner.tsx`
   - Replace hardcoded strings
   - Validate approach

### Phase 2: Migration (Week 2-3)

1. **Constants First**

   - Extract from `src/lib/constants.ts`
   - Update all references

2. **Component Migration**
   - Critical path components
   - Settings components
   - Recipe display

---

## Usage Patterns

### Basic Component Usage

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('actions.save')}</button>;
}
```

### Error Messages

```typescript
const tErrors = useTranslations('errors');
const errorMessage = tErrors('file.tooLarge');
```

### Settings Labels

```typescript
const tSettings = useTranslations('settings');
return <h1>{tSettings('page.title')}</h1>;
```

---

## Type Safety

### Configuration

```typescript
// src/lib/i18n.ts
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
```

### Global Types

```typescript
interface Messages {
  common: typeof import('../locales/en/common.json');
  errors: typeof import('../locales/en/errors.json');
  settings: typeof import('../locales/en/settings.json');
}

declare global {
  interface IntlMessages extends Messages {}
}
```

---

## Success Criteria

### Technical

- [ ] All hardcoded strings converted to translations
- [ ] No functionality regression
- [ ] <5% bundle size increase
- [ ] 100% TypeScript coverage

### User Experience

- [ ] All text displays correctly
- [ ] No layout issues
- [ ] Mobile responsiveness maintained
- [ ] Error handling works properly

---

## Future Language Support

### Easy Addition Pattern

```typescript
// To add Spanish later:
export const locales = ['en', 'es'] as const;

// Add corresponding files:
// locales/es/common.json
// locales/es/errors.json
// locales/es/settings.json
```

### AI Content Localization

```typescript
// Claude prompt with language specification
const prompt = `
Analyze this fridge photo and create a recipe in ${
  locale === 'es' ? 'Spanish' : 'English'
}.
Respond entirely in ${locale === 'es' ? 'Spanish' : 'English'}.
`;
```

---

**Document Status**: ✅ **CORE SPEC COMPLETE**  
**Focus**: Foundation and core functionality  
**Next**: Implementation Plan Part 1  
**Last Updated**: June 28, 2025
