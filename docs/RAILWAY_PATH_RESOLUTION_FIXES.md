# Railway Path Resolution Fixes

## 🚨 **Issue: Module Resolution Errors on Railway**

Railway build was failing with:

```
Module not found: Can't resolve '@/components/FridgeUploader'
Module not found: Can't resolve '@/components/RecipeDisplay'
Module not found: Can't resolve '@/components/OnboardingBanner'
Module not found: Can't resolve '@/components/ApiKeyRequiredBanner'
Module not found: Can't resolve '@/lib/settings'
```

## 🔍 **Root Cause**

Railway's build environment (Nixpacks) sometimes has different module resolution behavior than local development environments, particularly with TypeScript path mapping and Next.js alias resolution.

## ✅ **Fixes Applied**

### **1. Enhanced Next.js Webpack Configuration**

```typescript
// next.config.ts
webpack: (config) => {
  // Explicit path aliases for Railway
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, './src'),
    '@/components': path.resolve(__dirname, './src/components'),
    '@/lib': path.resolve(__dirname, './src/lib'),
    '@/types': path.resolve(__dirname, './src/types'),
  };

  // Enhanced module resolution
  config.resolve.modules = [
    path.resolve(__dirname, './src'),
    path.resolve(__dirname, './node_modules'),
    'node_modules',
  ];

  return config;
};
```

### **2. Enhanced TypeScript Configuration**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types": ["./src/types/index"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### **3. Added .npmrc for Railway Compatibility**

```
# .npmrc
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
legacy-peer-deps=false
```

## 🎯 **How These Fixes Work**

### **Next.js Webpack Aliases**

- **Explicit paths**: Each alias is mapped to absolute paths
- **Multiple resolution paths**: Ensures Railway can find modules in different scenarios
- **Backwards compatibility**: Maintains existing functionality while adding Railway support

### **Enhanced TypeScript Paths**

- **baseUrl**: Establishes root for relative path resolution
- **Granular mapping**: Specific paths for each commonly imported directory
- **Type safety**: Maintains TypeScript intellisense and type checking

### **NPM Configuration**

- **shamefully-hoist**: Flattens node_modules structure for easier resolution
- **Peer dependencies**: Handles dependency resolution more flexibly
- **Railway compatibility**: Optimizes for Railway's Node.js environment

## 📋 **Verification Steps**

### **Local Build**

```bash
npm run build
# ✅ Should compile successfully with all imports resolved
```

### **Railway Deployment**

```bash
railway up
# ✅ Should build without module resolution errors
```

### **Path Resolution Test**

```typescript
// These imports should all work:
import { FridgeUploader } from '@/components/FridgeUploader';
import { settings } from '@/lib/settings';
import type { Recipe } from '@/types';
```

## 🔧 **Alternative Solutions (If Still Failing)**

### **Option 1: Relative Imports**

If path resolution continues to fail, we can convert to relative imports:

```typescript
// Instead of: import { FridgeUploader } from '@/components/FridgeUploader';
import { FridgeUploader } from '../components/FridgeUploader';
```

### **Option 2: Nixpacks Configuration**

Add explicit Nixpacks configuration to Railway:

```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ["nodejs_22"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]
```

### **Option 3: Docker Override**

Use explicit Dockerfile instead of Nixpacks:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🚀 **Current Status**

✅ **Enhanced webpack configuration** for explicit module resolution  
✅ **Detailed TypeScript paths** for all import scenarios  
✅ **NPM configuration** optimized for Railway  
✅ **Local build verified** working correctly  
✅ **Ready for Railway deployment** with improved path resolution

The module resolution errors should now be fixed on Railway's build environment!

## 📁 **Files Modified**

- `next.config.ts` - Enhanced webpack alias configuration
- `tsconfig.json` - Added explicit path mappings
- `.npmrc` - Added Railway-compatible npm settings
- `railway.json` - Maintained existing build configuration

All changes are backwards compatible and improve module resolution across different deployment environments.
