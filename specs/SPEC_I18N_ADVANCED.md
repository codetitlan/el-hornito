# El Hornito - i18n Advanced Specification

## Overview

Refinement and enhancement guidelines for El Hornito's i18n system after the English-only foundation is stable. This focuses on adding **one additional language** and performance optimizations.

**Scope:** Refinement phase - adding Spanish as second language  
**Philosophy:** Keep it simple, focus on user value  
**Timeline:** Only when business case is clear

## Adding Spanish (Phase 2)

### Why Spanish First

- Large user base in Spanish-speaking markets
- Food content is highly culturally relevant
- Good test case for Romance language patterns
- Clear business opportunity

### Implementation Steps

#### 1. Expand Configuration

```typescript
// Simple expansion from English-only
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Add locale detection
export function detectLocale(): Locale {
  // 1. User setting preference
  // 2. Browser language
  // 3. Default to English
  return getUserPreference() || getBrowserLocale() || 'en';
}
```

#### 2. Create Spanish Translations

```
locales/
├── en/ (existing)
│   ├── common.json
│   ├── errors.json
│   └── settings.json
└── es/ (new - mirror structure)
    ├── common.json
    ├── errors.json
    └── settings.json
```

#### 3. Language Switcher Component

```typescript
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    router.push(`/${newLocale}`);
  };

  return (
    <select value={locale} onChange={(e) => handleChange(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

## Spanish Translation Examples

### Key Translations

```json
// locales/es/common.json
{
  "app": {
    "title": "El Hornito - IA de Nevera a Receta",
    "tagline": "Transforma el contenido de tu nevera en recetas deliciosas"
  },
  "actions": {
    "save": "Guardar",
    "saving": "Guardando...",
    "saved": "Todo Guardado",
    "cancel": "Cancelar",
    "upload": "Subir Foto",
    "generate": "Generar Receta"
  }
}
```

```json
// locales/es/settings.json
{
  "page": {
    "title": "Configuración",
    "subtitle": "Personaliza tu experiencia culinaria"
  },
  "cookingPreferences": {
    "title": "Preferencias Culinarias",
    "cuisineTypes": {
      "label": "Tipos de Cocina Favoritos",
      "description": "Selecciona los tipos de cocina que más disfrutas"
    }
  }
}
```

## AI Recipe Localization

### Prompt Engineering for Spanish

```typescript
// Enhanced prompts with language specification
const createRecipePrompt = (locale: Locale, fridgeAnalysis: string) => {
  const prompts = {
    en: `Analyze this fridge photo and create a recipe in English. 
         Use common ingredients available in the US/UK.
         Respond entirely in English.`,

    es: `Analiza esta foto de refrigerador y crea una receta en español.
         Usa ingredientes comunes disponibles en México/España.
         Responde completamente en español.
         
         Foto del refrigerador: ${fridgeAnalysis}`,
  };

  return prompts[locale];
};
```

### Regional Cuisine Adaptations

```json
// Spanish cuisine preferences
{
  "cuisineTypes": {
    "mexican": "Mexicana",
    "spanish": "Española",
    "latin": "Latinoamericana",
    "italian": "Italiana",
    "mediterranean": "Mediterránea"
  },
  "measurementSystem": "metric",
  "temperatureUnit": "celsius"
}
```

## Performance Optimizations

### Bundle Size Management

```typescript
// Dynamic translation loading
const loadTranslations = async (locale: Locale) => {
  const [common, errors, settings] = await Promise.all([
    import(`../locales/${locale}/common.json`),
    import(`../locales/${locale}/errors.json`),
    import(`../locales/${locale}/settings.json`),
  ]);

  return {
    common: common.default,
    errors: errors.default,
    settings: settings.default,
  };
};
```

### Translation Caching

```typescript
// Simple in-memory cache for translations
const translationCache = new Map<string, any>();

export const getCachedTranslations = (locale: Locale) => {
  if (!translationCache.has(locale)) {
    const translations = loadTranslations(locale);
    translationCache.set(locale, translations);
  }
  return translationCache.get(locale);
};
```

## User Experience Enhancements

### Smart Language Detection

```typescript
// Remember user language preference
export function useLanguagePreference() {
  const [locale, setLocale] = useState<Locale>(() => {
    // Check user settings first, then browser, then default
    return (
      settingsManager.getLocalePreference() || detectBrowserLanguage() || 'en'
    );
  });

  // Persist preference when changed
  useEffect(() => {
    settingsManager.setLocalePreference(locale);
  }, [locale]);

  return [locale, setLocale] as const;
}
```

### Graceful Fallbacks

```typescript
// Fallback to English if Spanish translation missing
export function useTranslationWithFallback(namespace: string) {
  const t = useTranslations(namespace);

  return (key: string) => {
    try {
      return t(key);
    } catch {
      // Fallback to English translation
      const fallbackT = useTranslations(namespace, { locale: 'en' });
      return fallbackT(key);
    }
  };
}
```

## Quality Assurance

### Translation Validation

```typescript
// Ensure all English keys have Spanish translations
function validateTranslationCompleteness() {
  const englishKeys = getAllTranslationKeys('en');
  const spanishKeys = getAllTranslationKeys('es');

  const missingKeys = englishKeys.filter((key) => !spanishKeys.includes(key));

  if (missingKeys.length > 0) {
    console.error('Missing Spanish translations:', missingKeys);
    return false;
  }

  return true;
}
```

### Performance Monitoring

```typescript
// Monitor bundle size impact
function measureI18nImpact() {
  const baseSize = measureBundleSize(['en']);
  const multiLangSize = measureBundleSize(['en', 'es']);

  const increase = (multiLangSize - baseSize) / baseSize;

  // Alert if increase > 15%
  if (increase > 0.15) {
    console.warn(`Bundle size increased by ${(increase * 100).toFixed(1)}%`);
  }
}
```

## Settings Integration

### Locale Preference Storage

```typescript
// Enhanced settings with locale support
interface UserSettings {
  // ... existing settings
  locale?: Locale;
  regionalSettings?: {
    measurementSystem: 'metric' | 'imperial';
    currency: string;
    dateFormat: string;
  };
}

// Settings manager updates
export class SettingsManager {
  // ... existing methods

  setLocale(locale: Locale) {
    const settings = this.loadSettings();
    settings.locale = locale;
    this.saveSettings(settings);
  }

  getLocale(): Locale {
    return this.loadSettings().locale || 'en';
  }
}
```

## Testing Strategy

### Translation Testing

```typescript
// Test Spanish translations exist and work
describe('Spanish Translations', () => {
  it('should have all required translation keys', () => {
    const englishKeys = getTranslationKeys('en');
    const spanishKeys = getTranslationKeys('es');

    expect(spanishKeys).toEqual(expect.arrayContaining(englishKeys));
  });

  it('should render Spanish UI correctly', () => {
    render(<App locale="es" />);
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });
});
```

### Performance Testing

```typescript
// Ensure performance doesn't degrade
describe('i18n Performance', () => {
  it('should load Spanish translations quickly', async () => {
    const start = performance.now();
    await loadTranslations('es');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100); // < 100ms
  });
});
```

## Migration Strategy

### Gradual Rollout

1. **Phase 1**: Deploy with Spanish translations but English-only UI
2. **Phase 2**: Enable language switcher for beta users
3. **Phase 3**: Full rollout with automatic language detection
4. **Phase 4**: Optimize based on usage data

### Content Strategy

- **Professional translation** for UI elements
- **Cultural review** by native Spanish speakers
- **Regular updates** to maintain translation quality
- **User feedback** collection for improvements

## Future Considerations

### When to Add More Languages

- **User demand**: Clear requests from specific regions
- **Business metrics**: Revenue opportunity in target markets
- **Technical readiness**: Current system performing well
- **Resource availability**: Translation and maintenance capacity

### Potential Third Language

- **French**: European market expansion
- **Portuguese**: Brazilian market opportunity
- **Decision criteria**: Business case + technical feasibility

---

**Document Status**: ✅ **ADVANCED SPEC COMPLETE**  
**Focus**: Spanish addition + performance refinement  
**Implementation**: After English foundation is proven stable  
**Last Updated**: June 28, 2025
