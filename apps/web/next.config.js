/** @type {import('next').NextConfig} */
// Sentry is optional - only use if package is installed
let withSentryConfig = null;
try {
  withSentryConfig = require('@sentry/nextjs').withSentryConfig;
} catch (e) {
  // Sentry not installed, continue without it
  console.log('Sentry not installed, skipping Sentry configuration');
}

// Create CSS file before Next.js starts building
const path = require('path');
const fs = require('fs');
const cssDir = path.join(process.cwd(), '.next', 'browser');
const cssFile = path.join(cssDir, 'default-stylesheet.css');
try {
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  fs.writeFileSync(cssFile, '', 'utf8');
} catch (e) {
  // Ignore errors - webpack plugin will handle it
}

const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  
  // Images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['@modele/types', 'clsx', 'zod', '@brandbook/ui'],
    optimizeCss: false, // Temporarily disabled due to CSS file errors during static generation
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  
  // Webpack optimizations (fallback for --webpack flag)
  webpack: (config, { isServer, dev, webpack }) => {
    // Ignore @sentry/nextjs if not installed to prevent build failures
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@sentry\/nextjs$/,
      })
    );
    
    // Handle CSS files that don't exist during build (like default-stylesheet.css)
    // Create CSS file for both server and client builds
    const path = require('path');
    const fs = require('fs');
    const createCSSFile = (outputPath) => {
      const cssDir = path.join(outputPath, 'browser');
      const cssFile = path.join(cssDir, 'default-stylesheet.css');
      
      try {
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }
        // Always write the file to ensure it exists
        fs.writeFileSync(cssFile, '', 'utf8');
      } catch (e) {
        // Log warning but don't fail the build
        console.warn('Could not create default-stylesheet.css:', e.message);
      }
    };
    
    // Create CSS file immediately when webpack config is called
    const outputPath = path.join(process.cwd(), '.next');
    createCSSFile(outputPath);
    
    // Add a plugin to intercept and replace default-stylesheet.css imports
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /default-stylesheet\.css$/,
        require.resolve('./src/lib/empty-css.js')
      )
    );
    
    // Add a custom plugin to create the CSS file early in the build
    config.plugins.push({
      apply: (compiler) => {
        const getOutputPath = () => {
          return compiler.options.output?.path || path.join(process.cwd(), '.next');
        };
        
        // Create CSS file as early as possible - after plugins are initialized
        compiler.hooks.afterPlugins.tap('DefaultStylesheetPlugin', () => {
          createCSSFile(getOutputPath());
        });
        
        // Create CSS file when environment is set up
        compiler.hooks.environment.tap('DefaultStylesheetPlugin', () => {
          createCSSFile(getOutputPath());
        });
        
        // Also try to create it before compilation
        compiler.hooks.beforeCompile.tap('DefaultStylesheetPlugin', () => {
          createCSSFile(getOutputPath());
        });
      },
    });
    
    if (isServer) {
      // Add a plugin to log what's trying to import default-stylesheet.css
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.normalModuleFactory.tap('CSSImportLogger', (nmf) => {
            nmf.hooks.beforeResolve.tap('CSSImportLogger', (data) => {
              if (data.request && data.request.includes('default-stylesheet.css')) {
                console.error('🔍 Found import of default-stylesheet.css:');
                console.error('  Request:', data.request);
                console.error('  Context:', data.context);
                console.error('  Issuer:', data.contextInfo?.issuer);
                // Log the stack trace to see where it's coming from
                if (data.contextInfo && data.contextInfo.issuer) {
                  console.error('  Full context:', JSON.stringify(data.contextInfo, null, 2));
                }
              }
            });
          });
        },
      });
    }
    
    // Optimisations pour le bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false, // Enable tree shaking if package.json allows
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
            // React chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Next.js chunk
            nextjs: {
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              name: 'nextjs',
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Security headers - Enhanced
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // CSP Policy - Enhanced security
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.sentry.io https://*.sentry.io",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self' blob:",
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: cspPolicy
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          ...(isProduction ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
        ],
      },
    ];
  },
  
  // Redirects si nÃ©cessaire
  async redirects() {
    return [];
  },
  
  // Rewrites si nÃ©cessaire
  async rewrites() {
    return [];
  },
};

// Bundle Analyzer (optional)
let config = nextConfig;
if (process.env.ANALYZE === 'true') {
  try {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
    config = withBundleAnalyzer(config);
  } catch (e) {
    console.log('Bundle Analyzer not installed, skipping');
  }
}

// Sentry Configuration (optional)
if (withSentryConfig) {
  const sentryWebpackPluginOptions = {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableClientWebpackPlugin: !process.env.SENTRY_DSN,
    disableServerWebpackPlugin: !process.env.SENTRY_DSN,
  };
  config = withSentryConfig(config, sentryWebpackPluginOptions);
}

module.exports = config;