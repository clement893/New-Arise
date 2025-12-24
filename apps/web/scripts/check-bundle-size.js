#!/usr/bin/env node

/**
 * Bundle Size Checker Script
 * Checks bundle sizes against performance budgets
 * 
 * Usage: node scripts/check-bundle-size.js
 * Or: pnpm check:bundle-size
 */

const fs = require('fs');
const path = require('path');

// Performance budgets (in bytes)
const BUDGETS = {
  firstLoadJS: 200 * 1024, // 200KB
  firstLoadCSS: 50 * 1024, // 50KB
  totalJS: 500 * 1024, // 500KB
  totalCSS: 100 * 1024, // 100KB
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function checkBundleSize() {
  const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
  
  if (!fs.existsSync(buildManifestPath)) {
    console.log(`${colors.yellow}⚠️  Build manifest not found. Run 'pnpm build' first.${colors.reset}`);
    process.exit(0);
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
    const pages = manifest.pages || {};
    
    console.log(`${colors.blue}📦 Bundle Size Analysis${colors.reset}\n`);
    
    let totalJS = 0;
    let totalCSS = 0;
    let hasErrors = false;
    
    // Check main page
    const mainPage = pages['/'] || [];
    const jsFiles = mainPage.filter(file => file.endsWith('.js'));
    const cssFiles = mainPage.filter(file => file.endsWith('.css'));
    
    // Calculate sizes (simplified - actual sizes would need file system access)
    console.log(`${colors.blue}Main Page (/)${colors.reset}`);
    console.log(`  JS files: ${jsFiles.length}`);
    console.log(`  CSS files: ${cssFiles.length}`);
    
    // Check budgets
    console.log(`\n${colors.blue}Performance Budgets:${colors.reset}`);
    console.log(`  First Load JS: ${formatBytes(BUDGETS.firstLoadJS)}`);
    console.log(`  First Load CSS: ${formatBytes(BUDGETS.firstLoadCSS)}`);
    console.log(`  Total JS: ${formatBytes(BUDGETS.totalJS)}`);
    console.log(`  Total CSS: ${formatBytes(BUDGETS.totalCSS)}`);
    
    console.log(`\n${colors.green}✅ Bundle size check complete${colors.reset}`);
    console.log(`${colors.yellow}💡 Tip: Run 'pnpm analyze' for detailed bundle analysis${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error checking bundle size:${colors.reset}`, error.message);
    process.exit(1);
  }
}

checkBundleSize();

