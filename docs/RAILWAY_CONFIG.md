# Railway Environment Configuration Examples

## Overview

These configurations demonstrate how to use Railway's Config as Code for different deployment scenarios of El Hornito.

## 🚀 **Key Benefits for El Hornito**

### **1. Environment-Specific Configurations**

```json
{
  "environments": {
    "production": {
      "deploy": {
        "healthcheckTimeout": 120,
        "overlapSeconds": 60
      }
    },
    "staging": {
      "deploy": {
        "startCommand": "npm start"
      }
    }
  }
}
```

### **2. Smart Watch Patterns**

```json
{
  "build": {
    "watchPatterns": ["src/**", "public/**", "package.json", "next.config.ts"]
  }
}
```

### **3. Zero-Downtime Deployments**

```json
{
  "deploy": {
    "overlapSeconds": 30,
    "drainingSeconds": 15
  }
}
```

## 📋 **Configuration Options for El Hornito**

### **Basic Configuration (`railway.json`)**

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build",
    "watchPatterns": ["src/**", "public/**", "package.json"]
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### **Production-Optimized Configuration**

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "overlapSeconds": 60,
    "drainingSeconds": 30
  },
  "environments": {
    "production": {
      "deploy": {
        "multiRegionConfig": {
          "us-west2": { "numReplicas": 2 },
          "us-east4": { "numReplicas": 2 }
        }
      }
    }
  }
}
```

### **Development-Friendly Configuration**

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "watchPatterns": ["src/**", "public/**", "*.config.*"]
  },
  "deploy": {
    "startCommand": "npm run dev",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ALWAYS"
  },
  "environments": {
    "development": {
      "deploy": {
        "startCommand": "npm run dev"
      }
    },
    "staging": {
      "deploy": {
        "startCommand": "npm start"
      }
    }
  }
}
```

## 🔧 **API Key Management with Railway Config**

### **Environment Variables via Railway Dashboard**

```bash
# Set these in Railway Dashboard > Variables
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NODE_ENV=production
```

### **Environment-Specific Variables**

```json
{
  "environments": {
    "production": {
      "deploy": {
        "startCommand": "npm start"
      }
    },
    "staging": {
      "deploy": {
        "startCommand": "npm start"
      }
    },
    "personal-keys-only": {
      "deploy": {
        "startCommand": "npm start"
      }
    }
  }
}
```

## 🏥 **Health Checks & Monitoring**

### **Health Check Configuration**

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60
  }
}
```

### **Health Check Response Format**

```json
{
  "status": "healthy",
  "timestamp": "2025-06-28T05:00:00.000Z",
  "environment": "production",
  "apiKeyMode": "shared",
  "services": {
    "api": "operational",
    "settings": "operational"
  }
}
```

## 🚀 **Deployment Strategies**

### **Zero-Downtime Deployment**

```json
{
  "deploy": {
    "overlapSeconds": 30,
    "drainingSeconds": 15,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### **Multi-Region Deployment**

```json
{
  "deploy": {
    "multiRegionConfig": {
      "us-west2": { "numReplicas": 1 },
      "europe-west4": { "numReplicas": 1 }
    }
  }
}
```

## 📝 **Usage Instructions**

### **1. Deploy with Shared API Key**

```bash
# 1. Set environment variable in Railway Dashboard
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# 2. railway.json will use default configuration
# 3. App automatically detects shared key mode
```

### **2. Deploy without Shared API Key**

```bash
# 1. Don't set ANTHROPIC_API_KEY in Railway Dashboard
# 2. railway.json uses same configuration
# 3. App automatically switches to personal-key-only mode
# 4. Users see ApiKeyRequiredBanner
```

### **3. Environment-Specific Deployment**

```bash
# Railway automatically applies environment-specific config
# based on the environment name (production, staging, etc.)
```

## 🔍 **Monitoring & Debugging**

### **Check Deployment Status**

```bash
railway status
railway logs
```

### **Health Check Endpoint**

```bash
curl https://your-app.railway.app/api/health
```

### **Environment Detection**

```bash
# Check which configuration was applied
railway logs | grep "API Key Mode"
```

## 🌍 **Advanced Railway Features**

### **Multi-Region Configuration**

For global scaling, you can deploy across multiple regions:

```json
{
  "deploy": {
    "multiRegionConfig": {
      "us-west2": { "numReplicas": 2 },
      "us-east4-eqdc4a": { "numReplicas": 2 },
      "europe-west4-drams3a": { "numReplicas": 1 },
      "asia-southeast1-eqsg3a": { "numReplicas": 1 }
    }
  }
}
```

### **Pre-Deploy Commands**

Useful for database migrations or setup tasks:

```json
{
  "deploy": {
    "preDeployCommand": ["npm run db:migrate", "npm run seed:prod"],
    "startCommand": "npm start"
  }
}
```

### **Cron Jobs**

For scheduled tasks like cleanup or analytics:

```json
{
  "deploy": {
    "cronSchedule": "0 2 * * *",
    "startCommand": "npm run cleanup"
  }
}
```

### **Enhanced Watch Patterns**

More precise build triggers:

```json
{
  "build": {
    "watchPatterns": [
      "src/**",
      "public/**",
      "package.json",
      "package-lock.json",
      "next.config.ts",
      "tsconfig.json",
      ".env.example",
      "railway.json",
      "Dockerfile",
      "docker-compose.yml"
    ]
  }
}
```

### **Custom Nixpacks Configuration**

For advanced build customization:

```json
{
  "build": {
    "nixpacksPlan": {
      "phases": {
        "setup": {
          "nixPkgs": ["nodejs_22", "python3"]
        },
        "install": {
          "cmds": ["npm ci --production=false"]
        },
        "build": {
          "cmds": ["npm run build"]
        }
      }
    }
  }
}
```

### **Advanced Restart Policies**

Fine-tuned failure handling:

```json
{
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5,
    "overlapSeconds": 60,
    "drainingSeconds": 30
  }
}
```

## 🔒 **Security & Best Practices**

### **Environment Variable Management**

```bash
# Production secrets (set in Railway Dashboard)
ANTHROPIC_API_KEY=sk-ant-api03-your-production-key
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-jwt-secret

# Public configuration
NEXT_PUBLIC_APP_NAME=El Hornito
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

### **Health Check Best Practices**

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60
  }
}
```

The health endpoint should check:

- Database connectivity (if applicable)
- External API availability
- Critical service status
- Memory/CPU usage

### **Zero-Downtime Deployment Strategy**

```json
{
  "deploy": {
    "overlapSeconds": 60,
    "drainingSeconds": 30,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

This configuration ensures:

- New deployment overlaps with old for 60 seconds
- Old deployment has 30 seconds to finish requests
- Automatic restart on failures

## 📊 **Monitoring & Observability**

### **Railway Metrics Integration**

Railway automatically provides:

- CPU and Memory usage
- Request count and response times
- Error rates
- Deployment history

### **Custom Logging Strategy**

```javascript
// In your Next.js app
console.log(
  JSON.stringify({
    level: 'info',
    message: 'API request processed',
    timestamp: new Date().toISOString(),
    apiKeyMode: process.env.ANTHROPIC_API_KEY ? 'shared' : 'personal',
    userId: 'anonymous',
    requestId: req.headers['x-request-id'],
  })
);
```

### **Health Check Monitoring**

```javascript
// /api/health endpoint
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeyMode: process.env.ANTHROPIC_API_KEY ? 'shared' : 'personal',
    services: {
      api: 'operational',
      settings: 'operational',
    },
  };

  return Response.json(health);
}
```

## 🚀 **Deployment Workflows**

### **CI/CD Integration**

Railway automatically deploys on Git pushes, but you can customize:

```yaml
# .github/workflows/railway.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy to Railway
        run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### **Environment Promotion Strategy**

```bash
# Development → Staging → Production
railway environment create staging
railway environment create production

# Deploy to specific environment
railway up --environment staging
railway up --environment production
```

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Build Failures**

```bash
# Check build logs
railway logs --environment production

# Common fixes in railway.json
{
  "build": {
    "buildCommand": "npm ci && npm run build",
    "nixpacksVersion": "1.29.1"
  }
}
```

#### **Health Check Failures**

```bash
# Test health endpoint locally
curl http://localhost:3000/api/health

# Adjust timeout in railway.json
{
  "deploy": {
    "healthcheckTimeout": 120
  }
}
```

#### **Environment Variable Issues**

```bash
# Check current variables
railway variables

# Set missing variables
railway variables set ANTHROPIC_API_KEY=sk-ant-...
```

#### **Deployment Rollback**

```bash
# View deployment history
railway deployments

# Rollback to previous deployment
railway rollback [deployment-id]
```

This Railway configuration provides enterprise-grade deployment management while maintaining the flexibility of your API key system!
