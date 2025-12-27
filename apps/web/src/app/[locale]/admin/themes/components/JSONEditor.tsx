'use client';

/**
 * JSONEditor Component
 * JSON editor with validation and formatting
 */

import { useState, useEffect, useCallback } from 'react';
import { Textarea, Alert, Button } from '@/components/ui';
import { Code, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import type { ThemeConfig } from '@modele/types';

interface JSONEditorProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
  onValidationChange?: (isValid: boolean, error: string | null) => void;
}

export function JSONEditor({ config, onChange, onValidationChange }: JSONEditorProps) {
  const [jsonValue, setJsonValue] = useState<string>('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize JSON value from config
  useEffect(() => {
    try {
      const formatted = JSON.stringify(config, null, 2);
      setJsonValue(formatted);
      setIsDirty(false);
      setIsValid(true);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la conversion du config en JSON');
      setIsValid(false);
    }
  }, [config]);

  // Validate JSON and notify parent
  const validateJSON = useCallback((value: string): { isValid: boolean; error: string | null; parsed: ThemeConfig | null } => {
    if (!value.trim()) {
      return { isValid: false, error: 'Le JSON ne peut pas être vide', parsed: null };
    }

    try {
      const parsed = JSON.parse(value) as ThemeConfig;
      
      // Basic validation
      if (typeof parsed !== 'object' || parsed === null) {
        return { isValid: false, error: 'Le JSON doit être un objet', parsed: null };
      }

      // Validate required color fields
      // Support both formats: primary_color or primary (short format)
      const colorMappings = {
        primary: ['primary_color', 'primary'],
        secondary: ['secondary_color', 'secondary'],
        danger: ['danger_color', 'danger'],
        warning: ['warning_color', 'warning'],
        info: ['info_color', 'info'],
        success: ['success_color', 'success'],
      };
      
      const missingColors: string[] = [];
      
      for (const [colorName, possibleKeys] of Object.entries(colorMappings)) {
        // Check if any of the possible keys exists
        const hasColor = possibleKeys.some(key => {
          // Check in root level
          if (parsed[key] && typeof parsed[key] === 'string') {
            return true;
          }
          // Check in colors object
          if ((parsed as any).colors && (parsed as any).colors[key] && typeof (parsed as any).colors[key] === 'string') {
            return true;
          }
          // Check in colors object with colorName (e.g., colors.primary)
          if ((parsed as any).colors && (parsed as any).colors[colorName] && typeof (parsed as any).colors[colorName] === 'string') {
            return true;
          }
          return false;
        });
        
        if (!hasColor) {
          missingColors.push(colorName);
        }
      }

      if (missingColors.length > 0) {
        return {
          isValid: false,
          error: `Couleurs manquantes: ${missingColors.map(c => `${c}_color ou ${c}`).join(', ')}`,
          parsed: null,
        };
      }

      return { isValid: true, error: null, parsed };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de syntaxe JSON';
      return { isValid: false, error: errorMessage, parsed: null };
    }
  }, []);

  const handleChange = (value: string) => {
    setJsonValue(value);
    setIsDirty(true);
    
    const validation = validateJSON(value);
    setIsValid(validation.isValid);
    setError(validation.error);
    
    // Notify parent of validation change
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.error);
    }

    // If valid, update parent config
    if (validation.isValid && validation.parsed) {
      onChange(validation.parsed);
    }
  };

  const handleFormat = () => {
    const validation = validateJSON(jsonValue);
    if (validation.isValid && validation.parsed) {
      const formatted = JSON.stringify(validation.parsed, null, 2);
      setJsonValue(formatted);
      setIsDirty(true);
    }
  };

  const handleReset = () => {
    try {
      const formatted = JSON.stringify(config, null, 2);
      setJsonValue(formatted);
      setIsDirty(false);
      setIsValid(true);
      setError(null);
      if (onValidationChange) {
        onValidationChange(true, null);
      }
    } catch (err) {
      setError('Erreur lors de la réinitialisation');
      setIsValid(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Éditeur JSON</h3>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleFormat} variant="outline" size="sm" disabled={!isValid}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Formater
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            Réinitialiser
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Erreur de validation">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              {isDirty && (
                <p className="text-sm text-muted-foreground mt-1">
                  Le JSON contient des erreurs. Corrigez-les avant de sauvegarder.
                </p>
              )}
            </div>
          </div>
        </Alert>
      )}

      {isValid && isDirty && (
        <Alert variant="success" title="JSON valide">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Le JSON est valide et sera appliqué lors de la sauvegarde.</p>
          </div>
        </Alert>
      )}

      <div className="relative">
        <Textarea
          value={jsonValue}
          onChange={(e) => handleChange(e.target.value)}
          className={`
            font-mono text-sm
            min-h-[400px]
            ${!isValid ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}
          `}
          placeholder='{"primary_color": "#2563eb", "secondary_color": "#6366f1", ...}'
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {jsonValue.split('\n').length} lignes
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-1">Conseils :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Utilisez le bouton "Formater" pour formater automatiquement le JSON</li>
          <li>Les couleurs doivent être au format hexadécimal (ex: #2563eb)</li>
          <li>Tous les champs de couleur sont requis</li>
          <li>Les modifications sont appliquées en temps réel si le JSON est valide</li>
        </ul>
      </div>
    </div>
  );
}

