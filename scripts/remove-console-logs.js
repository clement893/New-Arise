/**
 * Script to remove or wrap console.log statements in production code
 * This script scans TypeScript/JavaScript files and wraps console statements
 * in development checks or removes them entirely.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filesToProcess = [];

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, dist, build, .git
      if (!['node_modules', '.next', 'dist', 'build', '.git', 'coverage'].includes(file)) {
        findFiles(filePath, extensions);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      filesToProcess.push(filePath);
    }
  }
}

// Find all files
const srcDir = path.join(__dirname, '../apps/web/src');
findFiles(srcDir);

console.log(`Found ${filesToProcess.length} files to process`);

// Process each file
let processed = 0;
for (const filePath of filesToProcess) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Skip files that already use logger or have development checks
  if (content.includes('import.*logger') || content.includes('process.env.NODE_ENV')) {
    continue;
  }
  
  // Replace console.log with development check
  const logRegex = /console\.log\(/g;
  if (logRegex.test(content)) {
    content = content.replace(/console\.log\(/g, "process.env.NODE_ENV === 'development' && console.log(");
    modified = true;
  }
  
  // Replace console.debug with development check
  const debugRegex = /console\.debug\(/g;
  if (debugRegex.test(content)) {
    content = content.replace(/console\.debug\(/g, "process.env.NODE_ENV === 'development' && console.debug(");
    modified = true;
  }
  
  // Keep console.error and console.warn but add development check for non-critical ones
  // Note: This is a simple approach - manual review may be needed
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    processed++;
    console.log(`Processed: ${filePath}`);
  }
}

console.log(`\nProcessed ${processed} files`);
console.log('Please review the changes and test your application.');

