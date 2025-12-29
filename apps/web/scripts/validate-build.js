#!/usr/bin/env node
/**
 * Pre-build validation script
 * Runs fast checks before the build to catch errors early
 * This prevents wasting time on builds that will fail
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Running pre-build validation...\n');

let hasErrors = false;
const errors = [];

// Change to web app directory
const webDir = path.resolve(__dirname, '..');
process.chdir(webDir);

// 1. TypeScript type checking (fastest check, catches most errors)
console.log('1️⃣  Running TypeScript type check...');
try {
  // Check if type-check:ci script exists, fallback to type-check
  const packageJson = JSON.parse(fs.readFileSync(path.join(webDir, 'package.json'), 'utf8'));
  const typeCheckScript = packageJson.scripts['type-check:ci'] ? 'type-check:ci' : 'type-check';
  
  execSync(`pnpm ${typeCheckScript}`, {
    stdio: 'inherit',
    cwd: webDir,
    env: {
      ...process.env,
      // Force type checking even if SKIP_TYPE_CHECK is set
      SKIP_TYPE_CHECK: undefined,
    },
  });
  console.log('✅ TypeScript check passed\n');
} catch (error) {
  hasErrors = true;
  errors.push('TypeScript type checking failed');
  console.error('❌ TypeScript check failed\n');
}

// 2. Check for required files
console.log('2️⃣  Checking required files...');
const requiredFiles = [
  'packages/types/dist/theme.d.ts',
  'packages/types/dist/index.d.ts',
];
const missingFiles = requiredFiles.filter(file => {
  const fullPath = path.resolve(__dirname, '..', '..', '..', file);
  return !fs.existsSync(fullPath);
});

if (missingFiles.length > 0) {
  hasErrors = true;
  errors.push(`Missing required files: ${missingFiles.join(', ')}`);
  console.error(`❌ Missing files: ${missingFiles.join(', ')}\n`);
} else {
  console.log('✅ All required files present\n');
}

// 3. Check for common mistakes (quick pattern checks)
console.log('3️⃣  Checking for common mistakes...');
try {
  const srcDir = path.join(webDir, 'src');
  const checkPatterns = [
    {
      pattern: /variant=["']danger["']/g,
      message: 'Badge variant="danger" should be variant="error"',
      exclude: ['Button.tsx', 'Modal.tsx', 'Dropdown.tsx'], // These components support "danger"
    },
  ];

  const walkDir = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath, fileList);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        fileList.push(filePath);
      }
    });
    return fileList;
  };

  const tsFiles = walkDir(srcDir);
  let foundIssues = false;

  checkPatterns.forEach(({ pattern, message, exclude = [] }) => {
    tsFiles.forEach(filePath => {
      const fileName = path.basename(filePath);
      if (exclude.some(ex => fileName.includes(ex))) {
        return; // Skip excluded files
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(pattern);
      if (matches) {
        const relativePath = path.relative(webDir, filePath);
        console.error(`❌ ${relativePath}: ${message}`);
        foundIssues = true;
        hasErrors = true;
      }
    });
  });

  if (!foundIssues) {
    console.log('✅ No common mistakes found\n');
  } else {
    errors.push('Common mistakes found (see above)');
    console.log('');
  }
} catch (error) {
  console.error(`⚠️  Could not run pattern checks: ${error.message}\n`);
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (hasErrors) {
  console.error('\n❌ Pre-build validation FAILED');
  console.error('\nErrors found:');
  errors.forEach((error, i) => {
    console.error(`  ${i + 1}. ${error}`);
  });
  console.error('\n💡 Fix these errors before building to save time!\n');
  process.exit(1);
} else {
  console.log('\n✅ Pre-build validation PASSED');
  console.log('   Ready to build!\n');
  process.exit(0);
}
