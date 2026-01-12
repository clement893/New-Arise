/**
 * Inline script to apply cached theme BEFORE first paint
 * This prevents color flash by applying theme colors synchronously from cache
 * Must execute immediately in <head> before any rendering
 */

export const themeCacheInlineScript = `
(function() {
  'use strict';
  
  // Execute immediately - don't wait for DOMContentLoaded
  // This ensures colors are applied before any CSS is rendered
  
  try {
    // Dark mode removed - always use light mode
    // Ensure dark class is never present
    document.documentElement.classList.remove('dark');
    
    // Load theme variables from cache
    const root = document.documentElement;
    
    // Get cached theme from localStorage
    const cacheKey = 'modele_theme_cache';
    const cacheVersion = '1.0.0';
    const cacheExpiryMs = 5 * 60 * 1000; // 5 minutes
    
    const cachedStr = localStorage.getItem(cacheKey);
    let config = null;
    
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr);
        
        // Check version and expiry
        if (cached.version === cacheVersion) {
          const age = Date.now() - cached.timestamp;
          if (age <= cacheExpiryMs && cached.config) {
            config = cached.config;
          }
        }
      } catch (e) {
        // Cache corrupted, will use defaults below
      }
    }
    
    // If no valid cache, use ARISE default theme config
    // This prevents flash of old values
    if (!config) {
      config = {
        mode: "light",
        primary_color: "#0A3A40",
        secondary_color: "#D8B868",
        danger_color: "#dc2626",
        warning_color: "#b45309",
        info_color: "#0891b2",
        success_color: "#047857",
        font_family: "Inter",
        border_radius: "8px",
        colors: {
          primary: "#0A3A40",
          secondary: "#D8B868",
          danger: "#dc2626",
          warning: "#b45309",
          info: "#0891b2",
          success: "#047857",
          background: "#ffffff",
          foreground: "#0f172a",
          muted: "#f1f5f9",
          mutedForeground: "#64748b",
          border: "#e2e8f0",
          input: "#ffffff",
          ring: "#2563eb",
          destructive: "#dc2626",
          destructiveForeground: "#ffffff",
          successForeground: "#ffffff",
          warningForeground: "#ffffff",
          ariseDeepTeal: "#0A3A40",
          ariseDeepTealAlt: "#1B5E6B",
          ariseButtonPrimary: "#0F454D",
          ariseButtonPrimaryHover: "#0d4148",
          ariseGold: "#D8B868",
          ariseGoldAlt: "#F4B860",
          ariseDarkGray: "#2e2e2e",
          ariseLightBeige: "#F5F5DC",
          ariseBeige: "#E9E4D4",
          ariseTextDark: "#1a202c",
          ariseTextLight: "#ffffff"
        },
        typography: {
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontFamilyHeading: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontFamilySubheading: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }
      };
    }
    
    // Color generation functions (simplified inline version)
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }
    
    function rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }
    
    function rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) {
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
          h = ((b - r) / d + 2) / 6;
        } else {
          h = ((r - g) / d + 4) / 6;
        }
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    function hslToRgb(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = function(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    }
    
    function generateColorShades(hex) {
      const rgb = hexToRgb(hex);
      if (!rgb) return {};
      
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const baseLightness = hsl.l;
      const baseSaturation = hsl.s;
      const baseHue = hsl.h;
      
      function generateShade(targetLightness) {
        var adjustedSaturation = baseSaturation;
        if (targetLightness > baseLightness) {
          if (targetLightness >= 90) {
            var reduction = (targetLightness - baseLightness) / 200;
            adjustedSaturation = Math.max(30, baseSaturation * (1 - reduction * 0.5));
          } else {
            var reduction = (targetLightness - baseLightness) / 150;
            adjustedSaturation = Math.max(25, baseSaturation * (1 - reduction));
          }
        } else {
          adjustedSaturation = Math.min(100, baseSaturation * (1 + (baseLightness - targetLightness) / 150));
        }
        var shadeRgb = hslToRgb(baseHue, adjustedSaturation, targetLightness);
        return rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
      }
      
      return {
        50: generateShade(98),
        100: generateShade(93),
        200: generateShade(86),
        300: generateShade(76),
        400: generateShade(66),
        500: hex,
        600: generateShade(46),
        700: generateShade(36),
        800: generateShade(26),
        900: generateShade(16),
        950: generateShade(9)
      };
    }
    
    function generateRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? result[1] + ', ' + result[2] + ', ' + result[3] : '';
    }
    
    // Apply theme config (root already defined above)
    const colorsConfig = config.colors || {};
    const primaryColor = config.primary_color || colorsConfig.primary_color || colorsConfig.primary;
    const secondaryColor = config.secondary_color || colorsConfig.secondary_color || colorsConfig.secondary;
    const dangerColor = config.danger_color || colorsConfig.danger_color || colorsConfig.destructive || colorsConfig.danger;
    const warningColor = config.warning_color || colorsConfig.warning_color || colorsConfig.warning;
    const infoColor = config.info_color || colorsConfig.info_color || colorsConfig.info;
    const successColor = config.success_color || colorsConfig.success_color || colorsConfig.success;
    
    // Apply primary colors
    if (primaryColor) {
      const shades = generateColorShades(primaryColor);
      Object.entries(shades).forEach(function([shade, color]) {
        root.style.setProperty('--color-primary-' + shade, color);
        if (shade === '500') {
          root.style.setProperty('--color-primary-rgb', generateRgb(color));
        }
      });
    }
    
    // Apply secondary colors
    if (secondaryColor) {
      const shades = generateColorShades(secondaryColor);
      Object.entries(shades).forEach(function([shade, color]) {
        root.style.setProperty('--color-secondary-' + shade, color);
        if (!successColor) {
          root.style.setProperty('--color-success-' + shade, color);
        }
        if (shade === '500') {
          root.style.setProperty('--color-secondary-rgb', generateRgb(color));
          if (!successColor) {
            root.style.setProperty('--color-success-rgb', generateRgb(color));
          }
        }
      });
    }
    
    // Apply danger colors
    if (dangerColor) {
      const shades = generateColorShades(dangerColor);
      Object.entries(shades).forEach(function([shade, color]) {
        root.style.setProperty('--color-danger-' + shade, color);
        root.style.setProperty('--color-error-' + shade, color);
        if (shade === '500') {
          root.style.setProperty('--color-danger-rgb', generateRgb(color));
          root.style.setProperty('--color-error-rgb', generateRgb(color));
        }
      });
    }
    
    // Apply warning colors
    if (warningColor) {
      const shades = generateColorShades(warningColor);
      Object.entries(shades).forEach(function([shade, color]) {
        root.style.setProperty('--color-warning-' + shade, color);
        if (shade === '500') {
          root.style.setProperty('--color-warning-rgb', generateRgb(color));
        }
      });
    }
    
    // Apply info colors
    if (infoColor) {
      const shades = generateColorShades(infoColor);
      Object.entries(shades).forEach(function([shade, color]) {
        root.style.setProperty('--color-info-' + shade, color);
      });
    }
    
    // Apply success colors
    if (successColor) {
      const shades = generateColorShades(successColor);
      Object.entries(shades).forEach(function([shade, color]) {
        root.style.setProperty('--color-success-' + shade, color);
        if (shade === '500') {
          root.style.setProperty('--color-success-rgb', generateRgb(color));
        }
      });
    }
    
    // Apply theme color variables
    if (colorsConfig.background) {
      root.style.setProperty('--color-background', colorsConfig.background);
    }
    if (colorsConfig.foreground) {
      root.style.setProperty('--color-foreground', colorsConfig.foreground);
    }
    if (colorsConfig.muted) {
      root.style.setProperty('--color-muted', colorsConfig.muted);
    }
    if (colorsConfig.mutedForeground) {
      root.style.setProperty('--color-muted-foreground', colorsConfig.mutedForeground);
    }
    if (colorsConfig.border) {
      root.style.setProperty('--color-border', colorsConfig.border);
    }
    if (colorsConfig.input) {
      root.style.setProperty('--color-input', colorsConfig.input);
    }
    if (colorsConfig.ring) {
      root.style.setProperty('--color-ring', colorsConfig.ring);
    }
    
    // Apply ARISE brand colors from theme config
    // These use exact design colors by default, but can be customized via theme system
    const ariseDeepTeal = colorsConfig.ariseDeepTeal || '#0A3A40';
    const ariseDeepTealAlt = colorsConfig.ariseDeepTealAlt || '#1B5E6B';
    const ariseGold = colorsConfig.ariseGold || '#D8B868';
    const ariseGoldAlt = colorsConfig.ariseGoldAlt || '#F4B860';
    const ariseDarkGray = colorsConfig.ariseDarkGray || '#2e2e2e';
    const ariseLightBeige = colorsConfig.ariseLightBeige || '#F5F5DC';
    const ariseBeige = colorsConfig.ariseBeige || '#E9E4D4';
    const ariseTextDark = colorsConfig.ariseTextDark || '#1a202c';
    const ariseTextLight = colorsConfig.ariseTextLight || '#ffffff';
    
    root.style.setProperty('--color-arise-deep-teal', ariseDeepTeal);
    root.style.setProperty('--color-arise-deep-teal-alt', ariseDeepTealAlt);
    root.style.setProperty('--color-arise-gold', ariseGold);
    root.style.setProperty('--color-arise-gold-alt', ariseGoldAlt);
    root.style.setProperty('--color-arise-dark-gray', ariseDarkGray);
    root.style.setProperty('--color-arise-light-beige', ariseLightBeige);
    root.style.setProperty('--color-arise-beige', ariseBeige);
    root.style.setProperty('--color-arise-text-dark', ariseTextDark);
    root.style.setProperty('--color-arise-text-light', ariseTextLight);
    
    // Apply fonts
    if (config.font_family) {
      const fontFamily = config.font_family.trim();
      root.style.setProperty('--font-family', fontFamily + ', sans-serif');
      root.style.setProperty('--font-family-heading', fontFamily + ', sans-serif');
      root.style.setProperty('--font-family-subheading', fontFamily + ', sans-serif');
    }
    
    if (config.typography && config.typography.fontFamily) {
      const fontFamily = String(config.typography.fontFamily).trim();
      root.style.setProperty('--font-family', fontFamily);
      if (config.typography.fontFamilyHeading) {
        root.style.setProperty('--font-family-heading', String(config.typography.fontFamilyHeading));
      }
      if (config.typography.fontFamilySubheading) {
        root.style.setProperty('--font-family-subheading', String(config.typography.fontFamilySubheading));
      }
    }
    
    // Apply border radius (support both string and object formats)
    if (config.border_radius) {
      root.style.setProperty('--border-radius', config.border_radius);
    }
    
    // Support borderRadius object format (sm, md, lg, xl, full)
    if (config.borderRadius) {
      Object.entries(config.borderRadius).forEach(function([key, value]) {
        root.style.setProperty('--border-radius-' + key, String(value));
      });
    }
    
    // Apply typography fontSize
    if (config.typography && config.typography.fontSize) {
      Object.entries(config.typography.fontSize).forEach(function([key, value]) {
        root.style.setProperty('--font-size-' + key, String(value));
      });
    }
    
    // Apply spacing
    if (config.spacing) {
      Object.entries(config.spacing).forEach(function([key, value]) {
        root.style.setProperty('--spacing-' + key, String(value));
      });
    }
    
    // Update status colors
    root.style.setProperty('--color-status-todo', 'var(--color-primary-500)');
    root.style.setProperty('--color-status-in-progress', 'var(--color-warning-500)');
    root.style.setProperty('--color-status-done', 'var(--color-secondary-500)');
    root.style.setProperty('--color-status-error', 'var(--color-danger-500)');
    
    // Update chart colors
    root.style.setProperty('--color-chart-default', 'var(--color-primary-500)');
    root.style.setProperty('--color-chart-success', 'var(--color-secondary-500)');
    root.style.setProperty('--color-chart-warning', 'var(--color-warning-500)');
    root.style.setProperty('--color-chart-danger', 'var(--color-danger-500)');
    
    // Update text link color
    root.style.setProperty('--color-text-link', 'var(--color-primary-500)');
    root.style.setProperty('--color-text-link-rgb', 'var(--color-primary-rgb)');
    
    // Update error and success colors
    root.style.setProperty('--color-error', 'var(--color-danger-500)');
    root.style.setProperty('--color-error-rgb', 'var(--color-danger-rgb)');
    root.style.setProperty('--color-success', 'var(--color-secondary-500)');
    root.style.setProperty('--color-success-rgb', 'var(--color-secondary-rgb)');
    
  } catch (e) {
    // Silently fail - GlobalThemeProvider will handle it
  }
})();
`;

