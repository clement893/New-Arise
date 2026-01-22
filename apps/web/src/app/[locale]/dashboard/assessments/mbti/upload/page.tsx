'use client';

/**
 * MBTI Upload Page
 * Allows users to import their results from 16Personalities via URL
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { uploadMBTIPDFFromURL } from '@/lib/api/assessments';
import { formatError } from '@/lib/utils/formatError';

export default function MBTIPDFUploadPage() {
  const router = useRouter();
  const locale = useLocale();
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const validateProfileUrl = (url: string): boolean => {
    if (!url.trim()) {
      return false;
    }
    // Validate 16Personalities profile URL format - more flexible
    // Accepts www.16personalities.com/profiles/... or 16personalities.com/profiles/...
    // Also accepts URLs with query parameters or trailing slashes
    const trimmedUrl = url.trim();
    try {
      const urlObj = new URL(trimmedUrl);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();
      
      // Check if it's a 16personalities.com domain
      if (!hostname.includes('16personalities.com')) {
        return false;
      }
      
      // Check if path starts with /profiles/
      if (!pathname.startsWith('/profiles/')) {
        return false;
      }
      
      // Check if there's a profile ID after /profiles/
      const profileId = pathname.split('/profiles/')[1]?.split('/')[0];
      if (!profileId || profileId.length < 1) {
        return false;
      }
      
      return true;
    } catch (e) {
      // If URL parsing fails, try regex as fallback
      const urlPattern = /^https?:\/\/(www\.)?16personalities\.com\/profiles\/[a-zA-Z0-9]+/;
      return urlPattern.test(trimmedUrl);
    }
  };

  const handleUpload = async () => {
    // Validate inputs BEFORE starting upload process
    if (!profileUrl.trim()) {
      setError(locale === 'fr' ? 'Veuillez entrer une URL de profil 16Personalities' : 'Please enter a 16Personalities profile URL');
      return;
    }
    
    if (!validateProfileUrl(profileUrl)) {
      setError(locale === 'fr' 
        ? 'URL invalide. Format attendu: https://www.16personalities.com/profiles/...'
        : 'Invalid URL. Expected format: https://www.16personalities.com/profiles/...');
      return;
    }

    // Clean up any existing interval BEFORE starting new upload
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (actual progress will be handled by the API)
      // Progress increases slowly to 90%, then waits for API response
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          // Gradually increase to 90%, then slow down
          if (prev < 80) {
            return prev + 5;
          } else if (prev < 90) {
            // Slow down as we approach 90%
            return Math.min(prev + 1, 90);
          }
          // Stay at 90% until API completes
          return 90;
        });
      }, 300);

      let result;
      try {
        const trimmedUrl = profileUrl.trim();
        if (!validateProfileUrl(trimmedUrl)) {
          throw new Error(locale === 'fr' 
            ? 'URL invalide. Format attendu: https://www.16personalities.com/profiles/...'
            : 'Invalid URL. Expected format: https://www.16personalities.com/profiles/...');
        }
        result = await uploadMBTIPDFFromURL(trimmedUrl);
      } finally {
        // Always clean up interval when API call completes (success or error)
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
      
      // Set progress to 100% on success
      setUploadProgress(100);

      // Redirect to results page with assessment ID
      const assessmentId = result.assessment_id || (result as any).assessmentId || (result as any).id;
      if (assessmentId) {
        // Add a small delay to ensure database is synchronized before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(`/dashboard/assessments/mbti/results?id=${assessmentId}`);
      } else {
        throw new Error('No assessment ID returned');
      }
    } catch (err: unknown) {
      // Ensure interval is cleaned up in case of error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      const errorMessage = formatError(err);
      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset state on mount and cleanup on unmount
  useEffect(() => {
    // Reset any stale upload state when component mounts
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-8">
        <MotionDiv variant="slideUp" duration="normal">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/assessments/mbti')}
            className="mb-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center gap-8"
            disabled={isUploading}
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          <div className="mb-8 pb-6">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">Upload your </span>
              <span style={{ color: '#D5B667' }}>MBTI results</span>
            </h1>
            <p className="text-white">
              Import your results from 16Personalities to see them in ARISE
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-8">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e7eeef' }}>
                  <LinkIcon className="text-arise-deep-teal" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {locale === 'fr' ? 'Importer depuis URL' : 'Import from URL'}
                  </h2>
                  <p className="text-gray-600">
                    {locale === 'fr' ? 'Collez l\'URL de votre profil 16Personalities' : 'Paste your 16Personalities profile URL'}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-arise-beige p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-arise-teal mb-2">{locale === 'fr' ? 'Instructions :' : 'Instructions:'}</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• {locale === 'fr' ? 'Collez l\'URL de votre profil 16Personalities (ex: https://www.16personalities.com/profiles/6d65d1ec09592)' : 'Paste your 16Personalities profile URL (e.g., https://www.16personalities.com/profiles/6d65d1ec09592)'}</li>
                  <li>• {locale === 'fr' ? 'Le système téléchargera automatiquement le PDF depuis cette URL' : 'The system will automatically download the PDF from this URL'}</li>
                  <li>• {locale === 'fr' ? 'Le PDF sera analysé avec l\'intelligence artificielle pour extraire vos résultats' : 'The PDF will be analyzed with artificial intelligence to extract your results'}</li>
                  <li>• {locale === 'fr' ? 'Le processus peut prendre 15-45 secondes' : 'The process may take 15-45 seconds'}</li>
                </ul>
              </div>

              {/* URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'fr' ? 'URL de votre profil 16Personalities' : 'Your 16Personalities Profile URL'}
                </label>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => {
                    setProfileUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://www.16personalities.com/profiles/6d65d1ec09592"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-teal focus:border-arise-teal outline-none"
                  disabled={isUploading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  {locale === 'fr' ? 'Exemple : https://www.16personalities.com/profiles/6d65d1ec09592' : 'Example: https://www.16personalities.com/profiles/6d65d1ec09592'}
                </p>
              </div>

              {/* URL Display */}
              {profileUrl && validateProfileUrl(profileUrl) && !isUploading && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">{locale === 'fr' ? 'URL valide' : 'Valid URL'}</p>
                      <p className="text-sm text-green-700 break-all">
                        {profileUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Analysis in progress...
                    </span>
                    <span className="text-sm font-medium text-arise-teal">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-arise-teal h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {locale === 'fr' ? 'L\'analyse peut prendre quelques instants...' : 'Analysis may take a few moments...'}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 mb-1">Error</p>
                      <p className="text-sm text-red-700 mb-3">{error}</p>
                      
                      {/* Show helpful solution if it's a 403/private profile error */}
                      {(error.includes('403') || error.toLowerCase().includes('private') || error.toLowerCase().includes('forbidden')) && (
                        <div className="mt-3 p-3 bg-white rounded border border-red-300">
                          <p className="font-medium text-red-900 mb-2">
                            {locale === 'fr' ? '💡 Solution :' : '💡 Solution:'}
                          </p>
                          <div className="text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-red-600">1.</span>
                              <div>
                                <p className="font-medium">
                                  {locale === 'fr' ? 'Rendre votre profil public' : 'Make your profile public'}
                                </p>
                                <p className="text-xs">
                                  {locale === 'fr' 
                                    ? 'Allez dans les paramètres de 16Personalities et activez "Profil Public"'
                                    : 'Go to 16Personalities settings and enable "Public Profile"'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/assessments/mbti')}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={
                    !profileUrl.trim() || !validateProfileUrl(profileUrl) || isUploading
                  }
                  className="flex-1 flex items-center justify-center gap-8"
                  style={{ backgroundColor: '#D5B667', color: '#000000' }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {locale === 'fr' ? 'Téléchargement et analyse en cours...' : 'Downloading and analyzing...'}
                    </>
                  ) : (
                    <>
                      <LinkIcon size={20} />
                      {locale === 'fr' ? 'Importer depuis URL' : 'Import from URL'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle size={20} />
                {locale === 'fr' ? 'Besoin d\'aide ?' : 'Need help?'}
              </h3>
              <div className="space-y-4 text-sm text-blue-800">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="font-semibold text-yellow-900 mb-2">
                    {locale === 'fr' ? '⚠️ Profil Privé (Erreur 403)' : '⚠️ Private Profile (403 Error)'}
                  </p>
                  <p className="text-yellow-800 mb-2">
                    {locale === 'fr' 
                      ? 'Si vous obtenez une erreur "Access forbidden (403)", votre profil est privé. Vous devez le rendre public pour continuer.'
                      : 'If you get "Access forbidden (403)" error, your profile is private. You must make it public to continue.'}
                  </p>
                  <p className="font-medium text-yellow-900">
                    {locale === 'fr' ? 'Pour rendre votre profil public :' : 'To make your profile public:'}
                  </p>
                  <ol className="space-y-1 ml-4 list-decimal text-yellow-800">
                    <li>{locale === 'fr' ? 'Allez sur 16personalities.com et connectez-vous' : 'Go to 16personalities.com and log in'}</li>
                    <li>{locale === 'fr' ? 'Allez dans les paramètres de votre profil' : 'Go to your profile settings'}</li>
                    <li>{locale === 'fr' ? 'Activez l\'option "Profil Public" ou "Public Profile"' : 'Enable the "Public Profile" option'}</li>
                    <li>{locale === 'fr' ? 'Sauvegardez et réessayez' : 'Save and try again'}</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium mb-2">{locale === 'fr' ? 'Comment importer depuis URL :' : 'How to import from URL:'}</p>
                  <ol className="space-y-1 ml-4 list-decimal">
                    <li>{locale === 'fr' ? 'Assurez-vous que votre profil est public (voir l\'avertissement ci-dessus)' : 'Make sure your profile is public (see warning above)'}</li>
                    <li>{locale === 'fr' ? 'Allez sur votre page de profil (ex: https://www.16personalities.com/profiles/6d65d1ec09592)' : 'Go to your profile page (e.g., https://www.16personalities.com/profiles/6d65d1ec09592)'}</li>
                    <li>{locale === 'fr' ? 'Copiez l\'URL complète depuis la barre d\'adresse' : 'Copy the complete URL from the address bar'}</li>
                    <li>{locale === 'fr' ? 'Collez l\'URL ici et cliquez sur "Importer depuis URL"' : 'Paste the URL here and click "Import from URL"'}</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
