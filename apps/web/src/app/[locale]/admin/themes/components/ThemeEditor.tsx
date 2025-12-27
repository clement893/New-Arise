'use client';

/**
 * ThemeEditor Component
 * Main editor component with tabs for Form, JSON, and Preview
 */

import { useState, useEffect } from 'react';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { ThemeTabs } from './ThemeTabs';
import { ThemeForm } from './ThemeForm';
import { Card, Button, Alert } from '@/components/ui';
import type { Theme, ThemeConfig } from '@modele/types';
import type { ThemeFormData } from '../types';
import { X, Save } from 'lucide-react';

interface ThemeEditorProps {
  theme: Theme | null;
  onSave: (config: ThemeConfig, formData: ThemeFormData) => Promise<void>;
  onCancel: () => void;
}

export function ThemeEditor({ theme, onSave, onCancel }: ThemeEditorProps) {
  const { state, updateConfig, setActiveTab } = useThemeEditor(theme);
  const [formData, setFormData] = useState<ThemeFormData>({
    name: theme?.name || '',
    display_name: theme?.display_name || '',
    description: theme?.description || '',
    primary_color: (theme?.config as any)?.primary_color || '#2563eb',
    secondary_color: (theme?.config as any)?.secondary_color || '#6366f1',
    danger_color: (theme?.config as any)?.danger_color || '#dc2626',
    warning_color: (theme?.config as any)?.warning_color || '#d97706',
    info_color: (theme?.config as any)?.info_color || '#0891b2',
    success_color: (theme?.config as any)?.success_color || '#059669',
    font_family: (theme?.config as any)?.font_family || '',
    border_radius: (theme?.config as any)?.border_radius || '',
    mode: (theme?.config as any)?.mode || 'system',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (theme) {
      // Update form data when theme changes
      setFormData({
        name: theme.name,
        display_name: theme.display_name,
        description: theme.description || '',
        primary_color: (theme.config as any)?.primary_color || '#2563eb',
        secondary_color: (theme.config as any)?.secondary_color || '#6366f1',
        danger_color: (theme.config as any)?.danger_color || '#dc2626',
        warning_color: (theme.config as any)?.warning_color || '#d97706',
        info_color: (theme.config as any)?.info_color || '#0891b2',
        success_color: (theme.config as any)?.success_color || '#059669',
        font_family: (theme.config as any)?.font_family || '',
        border_radius: (theme.config as any)?.border_radius || '',
        mode: (theme.config as any)?.mode || 'system',
      });
    }
  }, [theme]);

  const handleFormChange = (field: keyof ThemeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Update config when colors change
    if (field.includes('_color') || field === 'font_family' || field === 'border_radius') {
      updateConfig({
        [field]: value,
      } as Partial<ThemeConfig>);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Build config from form data
      const config: ThemeConfig = {
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        danger_color: formData.danger_color,
        warning_color: formData.warning_color,
        info_color: formData.info_color,
        success_color: formData.success_color,
        font_family: formData.font_family || undefined,
        border_radius: formData.border_radius || undefined,
      } as ThemeConfig;

      await onSave(config, formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {theme ? `Éditer "${theme.display_name}"` : 'Créer un nouveau thème'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {theme ? 'Modifiez les propriétés du thème' : 'Remplissez le formulaire pour créer un nouveau thème'}
            </p>
          </div>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Erreur" className="mb-4">
            {error}
          </Alert>
        )}

        <ThemeTabs activeTab={state.activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {state.activeTab === 'form' && (
            <ThemeForm formData={formData} onChange={handleFormChange} />
          )}

          {state.activeTab === 'json' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Éditeur JSON - À implémenter dans le Batch 6
              </p>
            </div>
          )}

          {state.activeTab === 'preview' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Prévisualisation - À implémenter dans le Batch 9
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button onClick={onCancel} variant="outline" disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} variant="primary" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

