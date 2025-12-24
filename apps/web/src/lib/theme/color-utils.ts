/**
 * Color utilities for theme management
 * Generates color shades from base colors
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Lighten a color by a percentage
 */
function lighten(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const amount = percent / 100;
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));

  return rgbToHex(r, g, b);
}

/**
 * Darken a color by a percentage
 */
function darken(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const amount = percent / 100;
  const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)));

  return rgbToHex(r, g, b);
}

/**
 * Generate color shades from a base color
 * Returns an object with shades from 50 (lightest) to 900 (darkest)
 */
export function generateColorShades(baseColor: string): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
} {
  return {
    50: lighten(baseColor, 90),
    100: lighten(baseColor, 80),
    200: lighten(baseColor, 60),
    300: lighten(baseColor, 40),
    400: lighten(baseColor, 20),
    500: baseColor, // Base color
    600: darken(baseColor, 20),
    700: darken(baseColor, 40),
    800: darken(baseColor, 60),
    900: darken(baseColor, 80),
  };
}

/**
 * Generate RGB values from hex color
 */
export function generateRgb(color: string): string {
  const rgb = hexToRgb(color);
  if (!rgb) return '0, 0, 0';
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

