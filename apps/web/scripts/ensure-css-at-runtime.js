/**
 * Runtime script to ensure default-stylesheet.css exists and cache directory exists
 * This is called at server startup to ensure required directories exist
 */
const fs = require('fs');
const path = require('path');

// Try multiple possible paths
const possiblePaths = [
  path.join(__dirname, '..', '.next', 'browser', 'default-stylesheet.css'),
  path.join(process.cwd(), '.next', 'browser', 'default-stylesheet.css'),
  path.join(process.cwd(), 'apps', 'web', '.next', 'browser', 'default-stylesheet.css'),
];

let created = false;

possiblePaths.forEach((cssPath) => {
  try {
    const cssDir = path.dirname(cssPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
      console.log(`[Runtime CSS] Created directory: ${cssDir}`);
    }
    
    // Create empty CSS file if it doesn't exist
    if (!fs.existsSync(cssPath)) {
      fs.writeFileSync(cssPath, '/* Empty stylesheet - created at runtime */\n', 'utf8');
      console.log(`[Runtime CSS] Created file: ${cssPath}`);
      created = true;
    }
  } catch (error) {
    // Silently ignore errors for paths that don't exist
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Runtime CSS] Could not create CSS file at ${cssPath}:`, error.message);
    }
  }
});

// Ensure cache directory exists (Next.js needs this for image optimization)
const possibleCachePaths = [
  path.join(__dirname, '..', '.next', 'cache'),
  path.join(process.cwd(), '.next', 'cache'),
  path.join(process.cwd(), 'apps', 'web', '.next', 'cache'),
];

possibleCachePaths.forEach((cachePath) => {
  try {
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });
      console.log(`[Runtime Cache] Created cache directory: ${cachePath}`);
    }
  } catch (error) {
    // Log warning but don't fail - cache directory creation is optional
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Runtime Cache] Could not create cache directory at ${cachePath}:`, error.message);
    }
  }
});

if (!created && process.env.NODE_ENV === 'development') {
  console.log('[Runtime CSS] CSS file already exists or could not be created');
}


