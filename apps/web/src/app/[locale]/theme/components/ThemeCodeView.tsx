/**
 * Theme Code View Component
 * Displays theme configuration as JSON code
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { Card, Button } from '@/components/ui';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ThemeCodeView() {
  const { theme } = useGlobalTheme();
  const [copied, setCopied] = useState(false);

  if (!theme?.config) {
    return <Card>Chargement...</Card>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(theme.config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(theme.config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${theme.name}-config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Theme Configuration (JSON)</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copié!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            Télécharger
          </Button>
        </div>
      </div>
      <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[600px]">
        <code>{JSON.stringify(theme.config, null, 2)}</code>
      </pre>
    </Card>
  );
}
