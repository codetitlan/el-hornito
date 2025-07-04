# El Hornito - Internationalization (i18n) Strategy

## Executive Summary

This document outlines a **lean, progressive** internationalization strategy for El Hornito. We'll implement a complete i18n infrastructure starting with **English-only** support, following YAGNI principles and progressive enhancement.

**Current Approach:** English-first implementation with extensible architecture  
**Philosophy:** Build the foundation right, expand incrementally  
**Focus:** Simplicity, type safety, minimal performance impact

## Current Codebase: Ready for i18n

**Why El Hornito is i18n-Ready:**

- ✅ Next.js 15 + TypeScript foundation
- ✅ Text content centralized in constants
- ✅ Component-based architecture
- ✅ Existing settings system for user preferences

**Text Content Categories:**

1. **UI Labels & Actions** - buttons, navigation, forms
2. **Error Messages** - validation, API errors, notifications
3. **Settings & Options** - cuisine types, dietary preferences
4. **AI Recipe Content** - handled via prompt engineering

## Implementation Plan: Progressive & Lean

### Phase 1: Foundation (English-Only)

**Goal:** Set up complete i18n infrastructure with English as baseline

**Technology Choice:** `next-intl`

- First-class Next.js 15 support
- TypeScript integration
- Easy future expansion

**Key Actions:**

1. Install dependencies and configure routing
2. Create translation files for all text content
3. Test on single component (`ApiKeyRequiredBanner.tsx`)
4. Migrate constants and all components progressively
5. Validate type safety and performance

### Phase 2: Validation & Refinement

**Goal:** Perfect the English implementation

**Key Actions:**

1. Test all user flows
2. Optimize performance
3. Document patterns for team
4. Prepare for future language addition

### Phase 3: Multi-Language Ready (Future)

**Goal:** Add second language when business requires it

**Key Actions:**

1. Add locale detection and switcher
2. Create translation workflows
3. Handle cultural adaptations
4. Scale infrastructure

## Key Challenges & Solutions

### Challenge 1: AI-Generated Content Localization

**Problem**: Recipe content is generated by Claude AI in English

**Solution**: **Prompt Engineering Only**

- Include target language specification in Claude prompts
- Explicitly request response in target language
- No multiple models or post-processing needed

### Challenge 2: Settings Data Structure

**Problem**: Complex nested settings objects

**Solution**: Namespace-based translation keys

```typescript
const t = useTranslations('settings.cookingPreferences');
// t('cuisineTypes.label') → "Favorite Cuisine Types"
```

### Challenge 3: Type Safety

**Problem**: Ensuring translation keys exist and are typed

**Solution**: TypeScript integration with next-intl

```typescript
// Auto-generated types from translation files
type TranslationKeys = 'common.actions.save' | 'settings.title' | ...
```

## Success Criteria

**Phase 1 Complete When:**

- ✅ All hardcoded text moved to translation files
- ✅ Type-safe translation usage throughout app
- ✅ No performance degradation
- ✅ Single component successfully migrated and tested
- ✅ Clear patterns established for team

**Ready for Phase 2 When:**

- ✅ Business case for additional language identified
- ✅ Translation workflow established
- ✅ Cultural adaptation requirements defined

## Next Steps

1. **Create detailed implementation specification** (separate document)
2. **Set up i18n infrastructure** with next-intl
3. **Test on ApiKeyRequiredBanner component** first
4. **Migrate all constants** to translation files
5. **Update all components** progressively
6. **Document patterns** for future development

---

_This strategy focuses on building a robust, maintainable foundation that can scale when business needs require additional languages, following YAGNI principles while ensuring the architecture is extensible._
