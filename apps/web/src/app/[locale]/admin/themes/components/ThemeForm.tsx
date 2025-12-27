'use client';

/**
 * ThemeForm Component
 * Form for editing theme basic properties
 */

import { Input, Textarea } from '@/components/ui';
import type { ThemeFormData } from '../types';

interface ThemeFormProps {
  formData: ThemeFormData;
  onChange: (field: keyof ThemeFormData, value: string) => void;
}

export function ThemeForm({ formData, onChange }: ThemeFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Nom technique <span className="text-danger">*</span>
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="mon-theme"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nom unique utilisé pour identifier le thème (sans espaces, en minuscules)
        </p>
      </div>

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-foreground mb-2">
          Nom d'affichage <span className="text-danger">*</span>
        </label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => onChange('display_name', e.target.value)}
          placeholder="Mon Thème"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nom affiché dans l'interface d'administration
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Description du thème..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Description optionnelle du thème
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="primary_color" className="block text-sm font-medium text-foreground mb-2">
            Couleur primaire <span className="text-danger">*</span>
          </label>
          <Input
            id="primary_color"
            type="color"
            value={formData.primary_color}
            onChange={(e) => onChange('primary_color', e.target.value)}
            className="h-10"
          />
          <Input
            value={formData.primary_color}
            onChange={(e) => onChange('primary_color', e.target.value)}
            placeholder="#2563eb"
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="secondary_color" className="block text-sm font-medium text-foreground mb-2">
            Couleur secondaire <span className="text-danger">*</span>
          </label>
          <Input
            id="secondary_color"
            type="color"
            value={formData.secondary_color}
            onChange={(e) => onChange('secondary_color', e.target.value)}
            className="h-10"
          />
          <Input
            value={formData.secondary_color}
            onChange={(e) => onChange('secondary_color', e.target.value)}
            placeholder="#6366f1"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="danger_color" className="block text-sm font-medium text-foreground mb-2">
            Couleur danger <span className="text-danger">*</span>
          </label>
          <Input
            id="danger_color"
            type="color"
            value={formData.danger_color}
            onChange={(e) => onChange('danger_color', e.target.value)}
            className="h-10"
          />
          <Input
            value={formData.danger_color}
            onChange={(e) => onChange('danger_color', e.target.value)}
            placeholder="#dc2626"
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="warning_color" className="block text-sm font-medium text-foreground mb-2">
            Couleur avertissement <span className="text-danger">*</span>
          </label>
          <Input
            id="warning_color"
            type="color"
            value={formData.warning_color}
            onChange={(e) => onChange('warning_color', e.target.value)}
            className="h-10"
          />
          <Input
            value={formData.warning_color}
            onChange={(e) => onChange('warning_color', e.target.value)}
            placeholder="#d97706"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="info_color" className="block text-sm font-medium text-foreground mb-2">
            Couleur info <span className="text-danger">*</span>
          </label>
          <Input
            id="info_color"
            type="color"
            value={formData.info_color}
            onChange={(e) => onChange('info_color', e.target.value)}
            className="h-10"
          />
          <Input
            value={formData.info_color}
            onChange={(e) => onChange('info_color', e.target.value)}
            placeholder="#0891b2"
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="success_color" className="block text-sm font-medium text-foreground mb-2">
            Couleur succès <span className="text-danger">*</span>
          </label>
          <Input
            id="success_color"
            type="color"
            value={formData.success_color}
            onChange={(e) => onChange('success_color', e.target.value)}
            className="h-10"
          />
          <Input
            value={formData.success_color}
            onChange={(e) => onChange('success_color', e.target.value)}
            placeholder="#059669"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="font_family" className="block text-sm font-medium text-foreground mb-2">
            Police de caractères
          </label>
          <Input
            id="font_family"
            value={formData.font_family || ''}
            onChange={(e) => onChange('font_family', e.target.value)}
            placeholder="Inter, sans-serif"
          />
        </div>

        <div>
          <label htmlFor="border_radius" className="block text-sm font-medium text-foreground mb-2">
            Rayon des bordures
          </label>
          <Input
            id="border_radius"
            value={formData.border_radius || ''}
            onChange={(e) => onChange('border_radius', e.target.value)}
            placeholder="8px"
          />
        </div>
      </div>
    </div>
  );
}

