/**
 * Theme Types
 * Shared types for theme management between frontend and backend
 */

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  danger_color: string;
  warning_color: string;
  info_color: string;
  success_color: string;
  font_family?: string;
  border_radius?: string;
  [key: string]: unknown; // Allow extra config fields
}

export interface ThemeBase {
  name: string;
  display_name: string;
  description?: string;
  config: ThemeConfig;
}

export interface ThemeCreate extends ThemeBase {
  is_active?: boolean;
}

export interface ThemeUpdate {
  display_name?: string;
  description?: string;
  config?: Partial<ThemeConfig>;
}

export interface Theme extends ThemeBase {
  id: number;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ThemeResponse {
  theme: Theme;
}

export interface ThemeListResponse {
  themes: Theme[];
  total: number;
  active_theme_id?: number;
}

export interface ThemeConfigResponse {
  id: number;
  name: string;
  display_name: string;
  config: ThemeConfig;
}
