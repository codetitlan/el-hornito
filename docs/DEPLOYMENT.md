# Production Deployment Guide

This guide covers deploying El Hornito with flexible API key configuration.

## 🚀 **Deployment Options**

### **Option 1: With Shared API Key**

Set the environment variable in your deployment platform:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### **Option 2: Personal Keys Only**

Simply omit the `ANTHROPIC_API_KEY` environment variable entirely.

---

## 🏗️ **Platform-Specific Instructions**

### **Vercel Deployment**

#### With Shared API Key:

```bash
# Via Vercel CLI
vercel env add ANTHROPIC_API_KEY
# Enter your API key when prompted

# Via Dashboard
# Go to Project Settings > Environment Variables
# Add: ANTHROPIC_API_KEY = sk-ant-api03-your-key
```

#### Personal Keys Only:

```bash
# Simply don't set ANTHROPIC_API_KEY
# Users will configure their own keys via the UI
```

### **Netlify Deployment**

#### With Shared API Key:

```bash
# Via Netlify CLI
netlify env:set ANTHROPIC_API_KEY sk-ant-api03-your-key

# Via Dashboard
# Go to Site Settings > Environment Variables
# Add: ANTHROPIC_API_KEY = sk-ant-api03-your-key
```

#### Personal Keys Only:

```bash
# Don't set ANTHROPIC_API_KEY
# App will automatically require personal keys
```

### **Docker Deployment**

#### With Shared API Key:

```bash
# Docker run
docker run -e ANTHROPIC_API_KEY=sk-ant-api03-your-key -p 3000:3000 elhornito

# Docker Compose
docker-compose up -d
# (Edit docker-compose.yml to uncomment ANTHROPIC_API_KEY)
```

#### Personal Keys Only:

```bash
# Docker run (no API key)
docker run -p 3000:3000 elhornito

# Docker Compose (default configuration)
docker-compose up -d
```

### **Railway/Render/DigitalOcean**

#### With Shared API Key:

```bash
# Set environment variable via platform dashboard:
ANTHROPIC_API_KEY=sk-ant-api03-your-key
```

#### Personal Keys Only:

```bash
# Simply don't set the environment variable
# Platform will deploy without shared key
```

---

## 🔧 **Runtime vs Build-time Configuration**

### **Current Approach (Build-time with Runtime Override)**

- Environment variables are checked at build time
- Can be overridden at runtime in Docker containers
- Requires rebuild when changing from shared → personal key mode

### **Fully Runtime Approach (Advanced)**

If you need fully dynamic runtime configuration, you can:

1. **Use the runtime-config.ts file** (already created)
2. **Modify API routes** to use `getConfig()` from Next.js
3. **Enable serverRuntimeConfig** in next.config.ts

Example:

```typescript
// In API routes
import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();
const apiKey =
  serverRuntimeConfig.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
```

---

## 🧪 **Testing Deployment Modes**

### **Test Shared Key Mode:**

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-your-key
npm run build && npm start
```

### **Test Personal Key Mode:**

```bash
unset ANTHROPIC_API_KEY  # or rename to ANTHROPIC_API_DISABLED_KEY
npm run build && npm start
```

### **Verify API Key Detection:**

```bash
curl -X POST http://localhost:3000/api/analyze-fridge -F "image=@test.jpg"

# Should return:
# Shared mode: Attempts to use shared key
# Personal mode: "Personal API key required. Please configure..."
```

---

## 🔒 **Security Best Practices**

### **For Shared Key Deployments:**

- Use environment variables, never hardcode keys
- Set up key rotation procedures
- Monitor API usage and costs
- Consider rate limiting per user

### **For Personal Key Deployments:**

- Educate users about API key security
- Provide clear instructions for getting Anthropic keys
- Consider implementing usage tracking per user
- Document the benefits of personal keys (user control, cost transparency)

---

## 🚨 **Troubleshooting**

### **500 Errors in Production:**

1. Check if you rebuilt after changing environment variables
2. Verify environment variables are actually set in your platform
3. Check server logs for specific error messages

### **Settings Page Errors:**

1. Ensure localStorage is available (HTTPS in production)
2. Check browser console for client-side errors
3. Verify the app was built with current environment state

### **API Key Issues:**

```bash
# Check what environment variables are detected
curl -I http://your-domain.com/settings

# Check API key requirement detection
curl -X POST http://your-domain.com/api/analyze-fridge -F "image=@test.jpg"
```

---

## 📊 **Monitoring & Analytics**

### **Key Metrics to Track:**

- API key configuration rate (% of users who set personal keys)
- API usage patterns (shared vs personal keys)
- Error rates by deployment mode
- User conversion from anonymous to configured

### **Recommended Logging:**

```typescript
// Add to your analytics
console.log('API Key Mode:', getApiKeyStatus().mode);
console.log('Config Source:', getApiKeyStatus().configSource);
```

This deployment guide ensures your El Hornito app works seamlessly regardless of whether you choose shared API keys, personal-only keys, or want to switch between modes.
