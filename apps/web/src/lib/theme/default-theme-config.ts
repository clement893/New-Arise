/**
 * Default theme configuration
 * This matches the DEFAULT_THEME_CONFIG from the backend
 * Used to reset the theme to its original values
 */

export const DEFAULT_THEME_CONFIG = {
  // Mode: system, light, or dark
  mode: "system",
  
  // Basic color fields (for backward compatibility and simple usage)
  primary_color: "#3b82f6",
  secondary_color: "#8b5cf6",
  danger_color: "#ef4444",
  warning_color: "#f59e0b",
  info_color: "#06b6d4",
  success_color: "#10b981",
  font_family: "Inter",
  border_radius: "8px",
  
  // Typography configuration
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontFamilyHeading: "Inter, system-ui, -apple-system, sans-serif",
    fontFamilySubheading: "Inter, system-ui, -apple-system, sans-serif",
    fontFamilyMono: "Fira Code, monospace",
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px"
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700"
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75"
    },
    textHeading: "#111827",
    textSubheading: "#374151",
    textBody: "#1f2937",
    textSecondary: "#6b7280",
    textLink: "#3b82f6",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  },
  
  // Colors configuration (comprehensive)
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    danger: "#ef4444",
    warning: "#f59e0b",
    info: "#06b6d4",
    success: "#10b981",
    background: "#ffffff",
    foreground: "#000000",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
    border: "#e5e7eb",
    input: "#ffffff",
    ring: "#0070f3",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    successForeground: "#ffffff",
    warningForeground: "#000000"
  },
  
  // Spacing configuration
  spacing: {
    unit: "8px",
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  
  // Border radius configuration
  borderRadius: {
    none: "0",
    sm: "2px",
    base: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    "2xl": "16px",
    full: "9999px"
  },
  
  // Shadow configuration
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  },
  
  // Breakpoint configuration
  breakpoint: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px"
  },
  
  // Effects configuration
  effects: {
    glassmorphism: {
      enabled: false,
      blur: "10px",
      saturation: "180%",
      opacity: 0.1,
      borderOpacity: 0.2
    },
    gradients: {
      enabled: false,
      direction: "to-br",
      intensity: 0.3
    },
    shadows: {
      enabled: false,
      primary: "0 0 15px rgba(59, 130, 246, 0.4)",
      secondary: "0 0 15px rgba(139, 92, 246, 0.4)"
    }
  }
} as const;

