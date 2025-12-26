/**
 * Font Installer Component
 * Allows installing Google Fonts and custom fonts for themes
 */

'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Search, Upload, X, Check } from 'lucide-react';

interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
}

interface FontInstallerProps {
  onFontSelect: (fontFamily: string, fontUrl?: string) => void;
  currentFont?: string;
}

export function FontInstaller({ onFontSelect, currentFont }: FontInstallerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string | null>(currentFont || null);
  const [showUpload, setShowUpload] = useState(false);

  // Popular Google Fonts (fallback if API fails)
  const popularFonts: GoogleFont[] = [
    { family: 'Inter', variants: ['400', '500', '600', '700'], category: 'sans-serif' },
    { family: 'Roboto', variants: ['300', '400', '500', '700'], category: 'sans-serif' },
    { family: 'Poppins', variants: ['400', '500', '600', '700'], category: 'sans-serif' },
    { family: 'Open Sans', variants: ['400', '600', '700'], category: 'sans-serif' },
    { family: 'Lato', variants: ['400', '700'], category: 'sans-serif' },
    { family: 'Montserrat', variants: ['400', '600', '700'], category: 'sans-serif' },
    { family: 'Raleway', variants: ['400', '600', '700'], category: 'sans-serif' },
    { family: 'Playfair Display', variants: ['400', '700'], category: 'serif' },
    { family: 'Merriweather', variants: ['400', '700'], category: 'serif' },
  ];

  useEffect(() => {
    loadGoogleFonts();
  }, []);

  const loadGoogleFonts = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from Google Fonts API
      const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDummyKey&sort=popularity');
      if (response.ok) {
        const data = await response.json();
        setGoogleFonts(data.items?.slice(0, 50) || popularFonts);
      } else {
        // Fallback to popular fonts
        setGoogleFonts(popularFonts);
      }
    } catch (error) {
      // Use popular fonts as fallback
      setGoogleFonts(popularFonts);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFonts = googleFonts.filter((font) =>
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFontSelect = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    // Generate Google Fonts URL
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700&display=swap`;
    onFontSelect(fontFamily, fontUrl);
    
    // Load font dynamically
    loadGoogleFont(fontFamily, fontUrl);
  };

  const loadGoogleFont = (fontFamily: string, fontUrl: string) => {
    // Check if font is already loaded
    const existingLink = document.querySelector(`link[data-font="${fontFamily}"]`);
    if (existingLink) {
      return;
    }

    // Create link element to load Google Font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.setAttribute('data-font', fontFamily);
    document.head.appendChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une police..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Police personnalisée
        </Button>
      </div>

      {showUpload && (
        <Card className="p-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Uploader une police personnalisée</h4>
            <Input
              type="file"
              accept=".woff,.woff2,.ttf,.otf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle custom font upload
                  const fontName = file.name.replace(/\.[^/.]+$/, '');
                  const fontUrl = URL.createObjectURL(file);
                  onFontSelect(fontName, fontUrl);
                  setSelectedFont(fontName);
                }
              }}
            />
            <p className="text-xs text-gray-500">
              Formats supportés: WOFF, WOFF2, TTF, OTF
            </p>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Chargement des polices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {filteredFonts.map((font) => {
            const isSelected = selectedFont === font.family;
            return (
              <button
                key={font.family}
                onClick={() => handleFontSelect(font.family)}
                className={`
                  p-3 border rounded-lg text-left transition-all
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold" style={{ fontFamily: font.family }}>
                      {font.family}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {font.category}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedFont && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-green-800 dark:text-green-200">
                Police sélectionnée: {selectedFont}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                La police sera appliquée au thème
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFont(null);
                onFontSelect('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

