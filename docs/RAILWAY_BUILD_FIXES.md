# Railway Deployment Build Errors - Fixed

## 🚨 **Issues Resolved**

### **1. Missing `@tailwindcss/postcss` module**

```
Error: Cannot find module '@tailwindcss/postcss'
```

**Root Cause**: TailwindCSS packages were in `devDependencies`, but Railway's production build doesn't install dev dependencies.

**Fix Applied**:

- ✅ Moved `@tailwindcss/postcss` from `devDependencies` to `dependencies`
- ✅ Moved `tailwindcss` from `devDependencies` to `dependencies`

### **2. Component Import Errors**

```
Module not found: Can't resolve '@/components/FridgeUploader'
Module not found: Can't resolve '@/components/RecipeDisplay'
Module not found: Can't resolve '@/components/OnboardingBanner'
```

**Root Cause**: Railway's build process was using `npm ci --production` which doesn't install TypeScript and other dev dependencies needed for the build.

**Fix Applied**:

- ✅ Updated Railway build command from `npm run build` to `npm ci && npm run build`
- ✅ This ensures all dependencies (including dev) are installed before building

## 📋 **Changes Made**

### **1. package.json**

```diff
  "dependencies": {
    "@anthropic-ai/sdk": "^0.55.0",
+   "@tailwindcss/postcss": "^4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.523.0",
    "next": "15.3.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-dropzone": "^14.3.8",
    "sharp": "^0.34.2",
    "tailwind-merge": "^3.3.1",
+   "tailwindcss": "^4",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
-   "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.3.4",
-   "tailwindcss": "^4",
    "typescript": "^5"
  }
```

### **2. Railway Configuration**

```diff
  "build": {
    "builder": "NIXPACKS",
-   "buildCommand": "npm run build",
+   "buildCommand": "npm ci && npm run build",
    "watchPatterns": [...]
  }
```

Applied to:

- ✅ `railway.json` (current config)
- ✅ `railway.basic.json` (basic template)
- ✅ `railway.advanced.json` (advanced template)

## 🔍 **Why This Happened**

1. **TailwindCSS Dependencies**: CSS processing dependencies must be available at runtime/build time, not just development
2. **Railway Build Process**: Railway uses Nixpacks which runs `npm ci --production` by default
3. **TypeScript Compilation**: Component imports need TypeScript to be available during build

## ✅ **Verification**

### **Local Build Test**

```bash
npm run build
# ✅ Compiles successfully
```

### **Railway Configuration Check**

```bash
npm run railway:check
# ✅ Shows updated build command: "npm ci && npm run build"
```

### **Dependencies Check**

```bash
# TailwindCSS packages now in dependencies
npm list @tailwindcss/postcss tailwindcss
# ✅ Both packages available in production build
```

## 🚀 **Ready for Railway Deployment**

The deployment errors should now be resolved:

1. ✅ **TailwindCSS**: Available in production dependencies
2. ✅ **Component Imports**: TypeScript available during build
3. ✅ **Build Process**: All dependencies installed before compilation
4. ✅ **Configuration**: Both basic and advanced templates updated

### **Deploy Command**

```bash
railway up
```

The build should now complete successfully on Railway without the module resolution errors!

## 📋 **File Changes Summary**

| File                    | Change                            | Reason                        |
| ----------------------- | --------------------------------- | ----------------------------- |
| `package.json`          | Moved TailwindCSS to dependencies | Needed for production builds  |
| `railway.json`          | Updated build command             | Install all deps before build |
| `railway.basic.json`    | Updated build command             | Template consistency          |
| `railway.advanced.json` | Updated build command             | Template consistency          |

All changes maintain compatibility with local development while fixing Railway deployment issues.
