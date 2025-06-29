#!/usr/bin/env node

/**
 * Translation Coverage Validation Script
 * Validates that all translation keys are used and no hardcoded strings remain
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  localesDir: 'src/locales',
  componentsDir: 'src/components',
  appDir: 'src/app',
  excludeFiles: ['.d.ts', '.test.', '.spec.'],
  excludePatterns: [
    /className=/,
    /style=/,
    /import.*from/,
    /console\./,
    /process\.env/,
    /localStorage/,
    /sessionStorage/
  ]
};

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load all translation keys from JSON files
function loadTranslationKeys() {
  const keys = new Set();
  const localesPath = path.join(process.cwd(), CONFIG.localesDir);

  if (!fs.existsSync(localesPath)) {
    log('❌ Locales directory not found', 'red');
    return keys;
  }

  function extractKeys(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        extractKeys(value, fullKey);
      } else {
        keys.add(fullKey);
      }
    }
  }

  // Read English translations (default locale)
  const enPath = path.join(localesPath, 'en');
  if (fs.existsSync(enPath)) {
    const files = fs.readdirSync(enPath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const namespace = path.basename(file, '.json');
      const content = JSON.parse(fs.readFileSync(path.join(enPath, file), 'utf8'));
      extractKeys(content, namespace);
    }
  }

  return keys;
}

// Find all component files
function findComponentFiles() {
  const files = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        // Skip excluded files
        if (!CONFIG.excludeFiles.some(pattern => item.includes(pattern))) {
          files.push(fullPath);
        }
      }
    }
  }

  // Scan components and app directories
  const componentsPath = path.join(process.cwd(), CONFIG.componentsDir);
  const appPath = path.join(process.cwd(), CONFIG.appDir);

  if (fs.existsSync(componentsPath)) {
    scanDirectory(componentsPath);
  }

  if (fs.existsSync(appPath)) {
    scanDirectory(appPath);
  }

  return files;
}

// Extract translation usage from component files
function extractTranslationUsage(files) {
  const usedKeys = new Set();
  const possibleHardcodedStrings = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);

    // Extract useTranslations/getTranslations namespace usage
    const translationMatches = content.match(/(?:useTranslations|getTranslations)\(['"`]([^'"`]+)['"`]\)/g);
    if (translationMatches) {
      for (const match of translationMatches) {
        const namespace = match.match(/['"`]([^'"`]+)['"`]/)[1];

        // Find t('key') usage within this component
        const tUsageRegex = new RegExp(`t\\(['"\`]([^'"\`]+)['"\`]\\)`, 'g');
        let tMatch;
        while ((tMatch = tUsageRegex.exec(content)) !== null) {
          const key = tMatch[1];
          usedKeys.add(`${namespace}.${key}`);
        }
      }
    }

    // Look for potential hardcoded strings (basic check)
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip if line matches exclusion patterns
      if (CONFIG.excludePatterns.some(pattern => pattern.test(line))) {
        continue;
      }

      // Look for quoted strings that might be user-facing
      const stringMatches = line.match(/['"`]([A-Z][a-zA-Z\s]{10,})['"`]/g);
      if (stringMatches) {
        for (const match of stringMatches) {
          const string = match.slice(1, -1); // Remove quotes

          // Skip common technical strings
          if (!/^(className|style|id|type|role|aria-|data-|https?:\/\/)/.test(string)) {
            possibleHardcodedStrings.push({
              file: relativePath,
              line: i + 1,
              string: string
            });
          }
        }
      }
    }
  }

  return { usedKeys, possibleHardcodedStrings };
}

// Main validation function
function validateTranslationCoverage() {
  log('\n🔍 El Hornito Translation Coverage Validation\n', 'bold');

  // Load available translation keys
  log('📚 Loading translation keys...', 'cyan');
  const availableKeys = loadTranslationKeys();
  log(`   Found ${availableKeys.size} translation keys`, 'green');

  // Find component files
  log('\n📂 Scanning component files...', 'cyan');
  const componentFiles = findComponentFiles();
  log(`   Found ${componentFiles.length} component files`, 'green');

  // Extract usage
  log('\n🔎 Analyzing translation usage...', 'cyan');
  const { usedKeys, possibleHardcodedStrings } = extractTranslationUsage(componentFiles);
  log(`   Found ${usedKeys.size} used translation keys`, 'green');

  // Calculate coverage
  const coveragePercentage = Math.round((usedKeys.size / availableKeys.size) * 100);

  // Find unused keys
  const unusedKeys = [...availableKeys].filter(key => !usedKeys.has(key));

  // Find missing keys (used but not defined)
  const missingKeys = [...usedKeys].filter(key => !availableKeys.has(key));

  // Report results
  log('\n📊 VALIDATION RESULTS\n', 'bold');

  // Coverage summary
  log(`Translation Usage Coverage: ${coveragePercentage}%`,
    coveragePercentage >= 90 ? 'green' : coveragePercentage >= 75 ? 'yellow' : 'red');
  log(`Available Keys: ${availableKeys.size}`);
  log(`Used Keys: ${usedKeys.size}`);
  log(`Unused Keys: ${unusedKeys.length}`);
  log(`Missing Keys: ${missingKeys.length}`);

  // Detailed reports
  if (missingKeys.length > 0) {
    log('\n❌ MISSING TRANSLATION KEYS:', 'red');
    missingKeys.forEach(key => log(`   - ${key}`, 'red'));
  }

  if (unusedKeys.length > 0 && unusedKeys.length <= 10) {
    log('\n⚠️  UNUSED TRANSLATION KEYS:', 'yellow');
    unusedKeys.forEach(key => log(`   - ${key}`, 'yellow'));
  } else if (unusedKeys.length > 10) {
    log(`\n⚠️  UNUSED TRANSLATION KEYS (showing first 10 of ${unusedKeys.length}):`, 'yellow');
    unusedKeys.slice(0, 10).forEach(key => log(`   - ${key}`, 'yellow'));
  }

  if (possibleHardcodedStrings.length > 0) {
    log('\n⚠️  POSSIBLE HARDCODED STRINGS:', 'yellow');
    possibleHardcodedStrings.slice(0, 5).forEach(item => {
      log(`   ${item.file}:${item.line} - "${item.string}"`, 'yellow');
    });
    if (possibleHardcodedStrings.length > 5) {
      log(`   ... and ${possibleHardcodedStrings.length - 5} more`, 'yellow');
    }
  }

  // Final assessment
  log('\n🎯 ASSESSMENT:', 'bold');
  if (missingKeys.length === 0 && coveragePercentage >= 90) {
    log('✅ EXCELLENT - Translation coverage is complete!', 'green');
  } else if (missingKeys.length === 0 && coveragePercentage >= 75) {
    log('✅ GOOD - Translation coverage is adequate', 'green');
  } else if (missingKeys.length > 0) {
    log('❌ ISSUES FOUND - Missing translation keys detected', 'red');
  } else {
    log('⚠️  REVIEW NEEDED - Low translation coverage', 'yellow');
  }

  // Recommendations
  log('\n💡 RECOMMENDATIONS:', 'bold');
  if (missingKeys.length > 0) {
    log('   1. Add missing translation keys to appropriate JSON files', 'cyan');
  }
  if (unusedKeys.length > 5) {
    log('   2. Consider removing unused translation keys to reduce bundle size', 'cyan');
  }
  if (possibleHardcodedStrings.length > 0) {
    log('   3. Review potential hardcoded strings and migrate to translations', 'cyan');
  }
  if (coveragePercentage >= 90 && missingKeys.length === 0) {
    log('   🎉 No action needed - i18n implementation is complete!', 'green');
  }

  log('');
  return {
    coveragePercentage,
    totalKeys: availableKeys.size,
    usedKeys: usedKeys.size,
    unusedKeys: unusedKeys.length,
    missingKeys: missingKeys.length,
    possibleHardcoded: possibleHardcodedStrings.length
  };
}

// Run validation if called directly
if (require.main === module) {
  validateTranslationCoverage();
}

module.exports = { validateTranslationCoverage };
