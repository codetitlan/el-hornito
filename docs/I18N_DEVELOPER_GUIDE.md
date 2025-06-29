# El Hornito - i18n Developer Guide

## 📖 **Overview**

This guide provides developers with everything they need to work with the i18n (internationalization) system in El Hornito. The application uses **next-intl** for type-safe, maintainable internationalization.

## 🏗 **Architecture Overview**

### **Core Components**

- **next-intl**: Primary i18n library providing type safety and React integration
- **@formatjs/intl-localematcher**: Locale detection and matching
- **Middleware**: Automatic locale routing and detection
- **Translation Files**: JSON files organized by namespace and locale

### **Directory Structure**

```
src/
├── i18n/
│   ├── routing.ts          # Locale configuration and routing setup
│   ├── navigation.ts       # i18n-aware navigation components
│   └── request.ts          # Server-side translation loading
├── locales/
│   └── en/                 # English translations (default)
│       ├── common.json     # UI text, navigation, actions, recipes
│       ├── errors.json     # Error messages, validation text
│       └── settings.json   # Configuration UI, forms, help text
└── middleware.ts           # Request interception for locale routing
```

## 🚀 **Quick Start**

### **Adding New Translation Keys**

1. **Choose the appropriate namespace:**

   - `common.json` - General UI, navigation, recipes, actions
   - `errors.json` - Error messages, validation failures
   - `settings.json` - Configuration UI, form labels, help text

2. **Add the key with proper nesting:**

   ```json
   // src/locales/en/common.json
   {
     "mySection": {
       "title": "My Section Title",
       "description": "Section description text",
       "buttons": {
         "save": "Save Changes",
         "cancel": "Cancel"
       }
     }
   }
   ```

3. **Use in components:**

   ```tsx
   // Client Components
   import { useTranslations } from 'next-intl';

   function MyComponent() {
     const t = useTranslations('common.mySection');

     return (
       <div>
         <h2>{t('title')}</h2>
         <p>{t('description')}</p>
         <button>{t('buttons.save')}</button>
       </div>
     );
   }

   // Server Components
   import { getTranslations } from 'next-intl/server';

   async function MyServerComponent({ locale }: { locale: string }) {
     const t = await getTranslations('common.mySection');

     return <h1>{t('title')}</h1>;
   }
   ```

### **Navigation Between Localized Routes**

```tsx
import { Link, useRouter } from '@/i18n/navigation';

function Navigation() {
  const router = useRouter();

  return (
    <nav>
      {/* Automatic locale handling */}
      <Link href="/settings">Settings</Link>

      {/* Programmatic navigation */}
      <button onClick={() => router.push('/settings')}>Go to Settings</button>
    </nav>
  );
}
```

## 📋 **Translation Patterns & Best Practices**

### **1. Namespace Organization**

**✅ Good: Logical grouping**

```json
{
  "fridgeUploader": {
    "title": "Upload Your Fridge Photo",
    "description": "Drag and drop or click to browse",
    "buttons": {
      "upload": "Upload Photo",
      "analyze": "Analyze Fridge"
    }
  }
}
```

**❌ Avoid: Flat structure**

```json
{
  "fridgeUploaderTitle": "Upload Your Fridge Photo",
  "fridgeUploaderDescription": "Drag and drop or click to browse",
  "fridgeUploaderUploadButton": "Upload Photo"
}
```

### **2. Dynamic Content & Pluralization**

```tsx
// Pluralization
const t = useTranslations('common.recipe');
<span>
  {recipe.servings} {t('servings')}
</span>;

// Dynamic content with variables
const t = useTranslations('common');
<p>{t('welcome', { name: user.name })}</p>;
```

### **3. Conditional Rendering**

```tsx
const t = useTranslations('common.recipe');

{
  !recipe ? (
    <div>
      <h3>{t('noRecipeTitle')}</h3>
      <p>{t('noRecipeDescription')}</p>
    </div>
  ) : (
    <RecipeDisplay recipe={recipe} />
  );
}
```

### **4. Form Labels & Validation**

```tsx
const t = useTranslations('settings.cookingPreferences');

<label>{t('dietaryRestrictions')}</label>
<input
  placeholder={t('dietaryRestrictionsPlaceholder')}
  aria-describedby="dietary-help"
/>
<small id="dietary-help">{t('dietaryRestrictionsHelp')}</small>
```

## 🔧 **Component Migration Checklist**

When migrating a component to use translations:

- [ ] **Identify all hardcoded strings** (user-facing text only)
- [ ] **Choose appropriate namespace** (common/errors/settings)
- [ ] **Add translation keys** with logical nesting
- [ ] **Import useTranslations** for client components
- [ ] **Import getTranslations** for server components
- [ ] **Replace hardcoded strings** with `t('key')` calls
- [ ] **Test component** in development
- [ ] **Verify no MISSING_MESSAGE errors** in console
- [ ] **Check TypeScript** for type safety

## ⚠️ **Common Gotchas & Troubleshooting**

### **MISSING_MESSAGE Errors**

**Problem**: Component shows `MISSING_MESSAGE` error instead of translated text.

**Solutions**:

1. **Check namespace access pattern:**

   ```tsx
   // ❌ Wrong
   const t = useTranslations('common');
   t('fridgeUploader.title'); // Undefined if not properly nested

   // ✅ Correct
   const t = useTranslations('common.fridgeUploader');
   t('title'); // Works with proper nesting
   ```

2. **Verify translation file structure:**

   ```json
   // Make sure the key exists at the specified path
   {
     "common": {
       "fridgeUploader": {
         "title": "Your Title Here"
       }
     }
   }
   ```

3. **Check message merging in `src/i18n/request.ts`:**

   ```tsx
   // ✅ Correct - preserves namespaces
   const messages = { common, errors, settings };

   // ❌ Wrong - flattens structure
   const messages = { ...common, ...errors, ...settings };
   ```

### **Server vs Client Component Differences**

```tsx
// ❌ Wrong - Using client hook in server component
async function ServerComponent() {
  const t = useTranslations('common'); // Error!
}

// ✅ Correct patterns
// Client Component
function ClientComponent() {
  const t = useTranslations('common');
  return <div>{t('title')}</div>;
}

// Server Component
async function ServerComponent({ locale }: { locale: string }) {
  const t = await getTranslations('common');
  return <div>{t('title')}</div>;
}
```

### **Navigation Issues**

```tsx
// ❌ Wrong - Using Next.js Link directly
import Link from 'next/link';
<Link href="/settings">Settings</Link>;

// ✅ Correct - Using i18n-aware navigation
import { Link } from '@/i18n/navigation';
<Link href="/settings">Settings</Link>;
```

## 🌍 **Adding New Languages**

To add a new language (e.g., Spanish):

1. **Create new locale directory:**

   ```bash
   mkdir src/locales/es
   ```

2. **Copy and translate JSON files:**

   ```bash
   cp src/locales/en/*.json src/locales/es/
   # Translate content in es/*.json files
   ```

3. **Update routing configuration:**

   ```tsx
   // src/i18n/routing.ts
   export const routing = defineRouting({
     locales: ['en', 'es'], // Add 'es'
     defaultLocale: 'en',
   });
   ```

4. **Test new locale:**
   ```
   http://localhost:3000/es        # Spanish homepage
   http://localhost:3000/es/settings # Spanish settings
   ```

## 📊 **Translation File Guidelines**

### **Naming Conventions**

- Use **camelCase** for keys: `yourRecipePreferences`
- Use **descriptive names**: `fridgeUploader.dragDrop` vs `text1`
- Group related keys: `buttons.save`, `buttons.cancel`

### **Content Guidelines**

- Keep strings **concise** but **descriptive**
- Use **consistent terminology** across the app
- Include **context** in key names when helpful
- Avoid **overly nested** structures (3-4 levels max)

### **File Organization**

```json
{
  "section": {
    "title": "Section Title",
    "description": "Description text",
    "actions": {
      "primary": "Main Action",
      "secondary": "Secondary Action"
    },
    "help": {
      "tooltip": "Help tooltip text",
      "link": "Learn more"
    }
  }
}
```

## 🧪 **Testing Translations**

### **Manual Testing Checklist**

- [ ] All text displays correctly (no MISSING_MESSAGE)
- [ ] Navigation works with localized routes
- [ ] Forms submit successfully with translated labels
- [ ] Error messages display translated text
- [ ] Dynamic content renders properly

### **Development Tools**

```bash
# Build check
npm run build

# Lint check
npm run lint

# Development server
npm run dev
```

### **Console Debugging**

- Check Network tab for translation file loading
- Look for `MISSING_MESSAGE` errors in console
- Verify proper locale detection in URL

## 🎯 **Performance Considerations**

### **Bundle Size Impact**

- Current implementation adds <5% to bundle size
- Translation files are loaded on demand
- No runtime performance impact detected

### **Optimization Tips**

- Keep translation files reasonably sized
- Use logical namespacing to enable code splitting
- Avoid deeply nested structures

## 💡 **Advanced Patterns**

### **Utility Component Translation**

```tsx
// Parent component passes translated strings
function ParentComponent() {
  const t = useTranslations('settings.cookingPreferences');

  return (
    <PreferenceChips
      label={t('cuisineTypes')}
      description={t('cuisineTypesDescription')}
      options={cuisines}
    />
  );
}
```

### **Error Boundary Translation**

```tsx
// Hybrid approach for class components
class ErrorBoundary extends Component {
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackUI // Functional component with useTranslations
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
```

### **Metadata Translation**

```tsx
// Dynamic metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations('common.app');

  return {
    title: t('title'),
    description: t('description'),
  };
}
```

## 📚 **Resources**

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [FormatJS Intl Guide](https://formatjs.io/docs/getting-started/installation/)
- [El Hornito i18n Implementation Plan](../plans/PLAN_I18N_CORE.md)

---

**Questions?** Check the implementation patterns in existing components or refer to the lessons learned in `PLAN_I18N_CORE.md`.
