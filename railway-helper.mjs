#!/usr/bin/env node

/**
 * Railway Configuration Helper for El Hornito
 * 
 * This script helps developers choose and configure the right Railway setup
 * for their deployment needs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configs = {
  basic: {
    name: 'Basic Configuration',
    description: 'Standard production-ready setup with health checks and zero-downtime deployment',
    file: 'railway.basic.json',
    features: [
      '✅ Health checks (/api/health)',
      '✅ Zero-downtime deployment (30s overlap)',
      '✅ Environment-specific settings',
      '✅ Smart watch patterns',
      '✅ Restart policies',
      '🚫 No multi-region (Railway free tier compatible)'
    ]
  },
  advanced: {
    name: 'Advanced Configuration',
    description: 'Enterprise-grade setup with multi-region, pre-deploy commands, and custom Nixpacks',
    file: 'railway.advanced.json',
    features: [
      '🌍 Multi-region deployment (requires Railway Pro)',
      '🔄 Pre-deploy commands',
      '⚙️ Custom Nixpacks configuration',
      '📊 Performance testing environment',
      '🚀 Enhanced scaling options'
    ]
  }
};

function showUsage() {
  console.log(`
🚂 Railway Configuration Helper for El Hornito

Usage:
  node railway-helper.mjs [command]
  npm run railway:<command>

Commands:
  list         Show available configurations
  use <type>   Switch to a configuration (basic|advanced)
  check        Verify current configuration
  help         Show this help message

Examples:
  node railway-helper.mjs list          # or npm run railway:list
  node railway-helper.mjs use basic     # or npm run railway:basic
  node railway-helper.mjs use advanced  # or npm run railway:advanced
  node railway-helper.mjs check         # or npm run railway:check
`);
}

function listConfigs() {
  console.log('\n🎯 Available Railway Configurations:\n');

  for (const [key, config] of Object.entries(configs)) {
    console.log(`📋 ${config.name} (${key})`);
    console.log(`   ${config.description}`);
    console.log(`   File: ${config.file}`);
    console.log('   Features:');
    config.features.forEach(feature => console.log(`     ${feature}`));
    console.log('');
  }
}

function switchToConfig(type) {
  if (!configs[type]) {
    console.error(`❌ Unknown configuration type: ${type}`);
    console.log('Available types: basic, advanced');
    return;
  }

  const config = configs[type];
  const sourceFile = path.join(__dirname, config.file);
  const targetFile = path.join(__dirname, 'railway.json');

  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Configuration file not found: ${sourceFile}`);
    return;
  }

  try {
    // Backup current config if it exists
    if (fs.existsSync(targetFile)) {
      const backupFile = path.join(__dirname, `railway.json.backup.${Date.now()}`);
      fs.copyFileSync(targetFile, backupFile);
      console.log(`📁 Backed up current config to: ${backupFile}`);
    }

    // Copy new config
    if (sourceFile !== targetFile) {
      fs.copyFileSync(sourceFile, targetFile);
    }

    console.log(`✅ Switched to ${config.name}`);
    console.log(`📄 Using configuration: ${config.file}`);
    console.log('\nFeatures enabled:');
    config.features.forEach(feature => console.log(`  ${feature}`));

    console.log(`
🚀 Next steps:
  1. Review the configuration: cat railway.json
  2. Set environment variables in Railway Dashboard
  3. Deploy: railway up
  4. Monitor: railway logs
`);

  } catch (error) {
    console.error(`❌ Error switching configuration: ${error.message}`);
  }
}

function checkConfig() {
  const configFile = path.join(__dirname, 'railway.json');

  if (!fs.existsSync(configFile)) {
    console.log('❌ No railway.json found');
    console.log('💡 Run "npm run railway:basic" to create one');
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    console.log('📋 Current Railway Configuration Analysis:\n');

    // Check basic features
    console.log('🔍 Build Configuration:');
    console.log(`   Builder: ${config.build?.builder || 'Not specified'}`);
    console.log(`   Build Command: ${config.build?.buildCommand || 'Not specified'}`);
    console.log(`   Watch Patterns: ${config.build?.watchPatterns?.length || 0} patterns`);

    console.log('\n🚀 Deploy Configuration:');
    console.log(`   Start Command: ${config.deploy?.startCommand || 'Not specified'}`);
    console.log(`   Health Check: ${config.deploy?.healthcheckPath || 'Not configured'}`);
    console.log(`   Health Timeout: ${config.deploy?.healthcheckTimeout || 'Not specified'}s`);
    console.log(`   Restart Policy: ${config.deploy?.restartPolicyType || 'Not specified'}`);

    console.log('\n🌍 Environment Support:');
    const environments = Object.keys(config.environments || {});
    if (environments.length > 0) {
      console.log(`   Environments: ${environments.join(', ')}`);
    } else {
      console.log('   No environment-specific configurations');
    }

    // Check for advanced features
    console.log('\n⚡ Advanced Features:');
    const hasMultiRegion = Object.values(config.environments || {}).some(env =>
      env.deploy?.multiRegionConfig
    );
    console.log(`   Multi-region: ${hasMultiRegion ? '✅ Configured' : '❌ Not configured'}`);

    const hasPreDeploy = config.deploy?.preDeployCommand;
    console.log(`   Pre-deploy commands: ${hasPreDeploy ? '✅ Configured' : '❌ Not configured'}`);

    const hasCustomNixpacks = config.build?.nixpacksPlan;
    console.log(`   Custom Nixpacks: ${hasCustomNixpacks ? '✅ Configured' : '❌ Not configured'}`);

    console.log(`
🎯 Configuration Type: ${hasMultiRegion || hasPreDeploy || hasCustomNixpacks ? 'Advanced' : 'Basic'}

💡 Tips:
  - Health check endpoint should be available at ${config.deploy?.healthcheckPath || '/api/health'}
  - Set ANTHROPIC_API_KEY in Railway Dashboard for shared key mode
  - Monitor deployments with: railway logs
`);

  } catch (error) {
    console.error(`❌ Error reading configuration: ${error.message}`);
  }
}

// Main command handling
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'list':
    listConfigs();
    break;
  case 'use':
    if (!arg) {
      console.error('❌ Please specify configuration type: basic or advanced');
      break;
    }
    switchToConfig(arg);
    break;
  case 'check':
    checkConfig();
    break;
  case 'help':
  default:
    showUsage();
    break;
}
