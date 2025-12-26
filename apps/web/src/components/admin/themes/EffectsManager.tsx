/**
 * Effects Manager Component
 * Allows importing and managing custom CSS effects from JSON files
 */

'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Upload, Plus, Trash2, FileJson, Code, Check } from 'lucide-react';

interface CustomEffect {
  name: string;
  css: Record<string, string>; // CSS properties as key-value pairs
  description?: string;
}

interface EffectsManagerProps {
  effects: Record<string, any>;
  onEffectsChange: (effects: Record<string, any>) => void;
}

export function EffectsManager({ effects, onEffectsChange }: EffectsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEffectName, setNewEffectName] = useState('');
  const [newEffectCss, setNewEffectCss] = useState('');
  const [newEffectDescription, setNewEffectDescription] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonEditorValue, setJsonEditorValue] = useState('');

  // Parse effects into custom effects array
  const customEffects: CustomEffect[] = Object.entries(effects || {})
    .filter(([key]) => key !== 'glassmorphism' && key !== 'shadows' && key !== 'gradients')
    .map(([name, value]) => ({
      name,
      css: typeof value === 'object' ? value : {},
      description: (value as any)?.description || '',
    }));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedEffects = JSON.parse(content);
        
        // Validate structure
        if (typeof importedEffects !== 'object' || Array.isArray(importedEffects)) {
          setJsonError('Le fichier JSON doit contenir un objet avec des effets');
          return;
        }

        // Merge imported effects with existing effects
        const mergedEffects = {
          ...effects,
          ...importedEffects,
        };

        onEffectsChange(mergedEffects);
        setJsonError(null);
      } catch (error) {
        setJsonError(`Erreur de parsing JSON: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleAddEffect = () => {
    if (!newEffectName.trim()) {
      setJsonError('Le nom de l\'effet est requis');
      return;
    }

    let cssObject: Record<string, string> = {};
    
    // Try to parse as JSON first
    try {
      cssObject = JSON.parse(newEffectCss || '{}');
    } catch {
      // If not JSON, try to parse as CSS string
      const cssPairs = newEffectCss.split(';').filter(Boolean);
      cssPairs.forEach((pair) => {
        const [key, value] = pair.split(':').map((s) => s.trim());
        if (key && value) {
          // Convert kebab-case to camelCase for CSS-in-JS
          const camelKey = key.replace(/-([a-z])/g, (g) => {
            const match = g[1];
            return match ? match.toUpperCase() : '';
          });
          if (camelKey) {
            cssObject[camelKey] = value;
          }
        }
      });
    }

    const newEffect: Record<string, any> = {
      ...cssObject,
    };

    if (newEffectDescription) {
      newEffect.description = newEffectDescription;
    }

    const updatedEffects = {
      ...effects,
      [newEffectName]: newEffect,
    };

    onEffectsChange(updatedEffects);
    setNewEffectName('');
    setNewEffectCss('');
    setNewEffectDescription('');
    setShowAddForm(false);
    setJsonError(null);
  };

  const handleDeleteEffect = (effectName: string) => {
    const updatedEffects = { ...effects };
    delete updatedEffects[effectName];
    onEffectsChange(updatedEffects);
  };

  const handleJsonEditorSave = () => {
    try {
      const parsed = JSON.parse(jsonEditorValue);
      onEffectsChange(parsed);
      setShowJsonEditor(false);
      setJsonError(null);
    } catch (error) {
      setJsonError(`Erreur de parsing JSON: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const openJsonEditor = () => {
    setJsonEditorValue(JSON.stringify(effects || {}, null, 2));
    setShowJsonEditor(true);
    setJsonError(null);
  };

  const exportEffects = () => {
    const dataStr = JSON.stringify(effects || {}, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theme-effects.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Import/Export */}
      <div className="flex gap-2 flex-wrap">
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="inline-block">
            <Button variant="outline" type="button" onClick={(e) => e.preventDefault()}>
              <Upload className="w-4 h-4 mr-2" />
              Importer depuis JSON
            </Button>
          </span>
        </label>
        <Button variant="outline" onClick={exportEffects}>
          <FileJson className="w-4 h-4 mr-2" />
          Exporter en JSON
        </Button>
        <Button variant="outline" onClick={openJsonEditor}>
          <Code className="w-4 h-4 mr-2" />
          Éditer le JSON
        </Button>
        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un effet
        </Button>
      </div>

      {jsonError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{jsonError}</p>
        </div>
      )}

      {/* JSON Editor */}
      {showJsonEditor && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Éditeur JSON des effets</h4>
              <Button variant="outline" size="sm" onClick={() => setShowJsonEditor(false)}>
                Fermer
              </Button>
            </div>
            <textarea
              value={jsonEditorValue}
              onChange={(e) => {
                setJsonEditorValue(e.target.value);
                setJsonError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm"
              rows={15}
            />
            <div className="flex gap-2">
              <Button onClick={handleJsonEditorSave} variant="primary">
                <Check className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              <Button variant="outline" onClick={() => setShowJsonEditor(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add Effect Form */}
      {showAddForm && (
        <Card className="p-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Ajouter un effet personnalisé</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom de l'effet <span className="text-red-500">*</span>
              </label>
              <Input
                value={newEffectName}
                onChange={(e) => setNewEffectName(e.target.value)}
                placeholder="mon-effet"
                helperText="Identifiant unique pour l'effet (sans espaces)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                value={newEffectDescription}
                onChange={(e) => setNewEffectDescription(e.target.value)}
                placeholder="Description de l'effet..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Propriétés CSS <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newEffectCss}
                onChange={(e) => setNewEffectCss(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm"
                rows={8}
                placeholder={`Format JSON:\n{\n  "backdropFilter": "blur(10px)",\n  "background": "rgba(255, 255, 255, 0.1)",\n  "border": "1px solid rgba(255, 255, 255, 0.2)"\n}\n\nOu format CSS:\nbackdrop-filter: blur(10px);\nbackground: rgba(255, 255, 255, 0.1);\nborder: 1px solid rgba(255, 255, 255, 0.2);`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format JSON ou CSS accepté. Les propriétés CSS seront converties automatiquement.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEffect} variant="primary">
                <Check className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddForm(false);
                setNewEffectName('');
                setNewEffectCss('');
                setNewEffectDescription('');
                setJsonError(null);
              }}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Custom Effects List */}
      {customEffects.length > 0 && (
        <div>
          <h4 className="font-semibold mb-4">Effets personnalisés</h4>
          <div className="space-y-3">
            {customEffects.map((effect) => (
              <Card key={effect.name} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold">{effect.name}</h5>
                      {effect.description && (
                        <span className="text-sm text-gray-500">- {effect.description}</span>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(effect.css, null, 2)}</pre>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteEffect(effect.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {customEffects.length === 0 && !showAddForm && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">
            Aucun effet personnalisé. Cliquez sur "Ajouter un effet" pour en créer un.
          </p>
        </Card>
      )}
    </div>
  );
}

