'use client';

/**
 * MBTI PDF Upload Page
 * Allows users to upload their PDF results from 16Personalities
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import FileUploadWithPreview from '@/components/ui/FileUploadWithPreview';
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle, FileText, Link as LinkIcon } from 'lucide-react';
import { uploadMBTIPDF, uploadMBTIPDFFromURL } from '@/lib/api/assessments';
import { formatError } from '@/lib/utils/formatError';

export default function MBTIPDFUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (!file) {
        setError('Aucun fichier sélectionné');
        return;
      }
      // Validate file
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Veuillez sélectionner un fichier PDF valide');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('Le fichier est trop volumineux. Taille maximale : 10MB');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const validateProfileUrl = (url: string): boolean => {
    if (!url.trim()) {
      return false;
    }
    // Validate 16Personalities profile URL format
    const urlPattern = /^https?:\/\/www\.16personalities\.com\/profiles\/[a-zA-Z0-9]+/;
    return urlPattern.test(url.trim());
  };

  const handleUpload = async () => {
    // Validate inputs BEFORE starting upload process
    if (inputMode === 'file' && !selectedFile) {
      setError('Veuillez sélectionner un fichier PDF');
      return;
    }
    
    if (inputMode === 'url' && !profileUrl.trim()) {
      setError('Veuillez entrer une URL de profil 16Personalities');
      return;
    }
    
    if (inputMode === 'url' && !validateProfileUrl(profileUrl)) {
      setError('URL invalide. Format attendu: https://www.16personalities.com/profiles/...');
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
        if (inputMode === 'file' && selectedFile) {
          result = await uploadMBTIPDF(selectedFile);
        } else if (inputMode === 'url' && profileUrl.trim()) {
          result = await uploadMBTIPDFFromURL(profileUrl.trim());
        } else {
          throw new Error('Mode d\'upload invalide');
        }
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
        throw new Error('Aucun ID d\'assessment retourné');
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
            className="mb-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            disabled={isUploading}
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour
          </Button>

          <div className="mb-8 pb-6">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">Upload your </span>
              <span style={{ color: '#D5B667' }}>MBTI PDF</span>
            </h1>
            <p className="text-white">
              Upload your results PDF from 16Personalities to see your results in ARISE
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-8">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e7eeef' }}>
                  <FileText className="text-arise-deep-teal" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Upload your results PDF
                  </h2>
                  <p className="text-gray-600">
                    Select the PDF you downloaded from 16Personalities
                  </p>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="mb-6 flex gap-4">
                <Button
                  variant={inputMode === 'file' ? 'primary' : 'outline'}
                  onClick={() => {
                    setInputMode('file');
                    setError(null);
                    setProfileUrl('');
                  }}
                  className="flex-1"
                  style={inputMode === 'file' ? { backgroundColor: '#D5B667', color: '#000000' } : undefined}
                >
                  <FileText size={18} className="mr-2" />
                  Upload a PDF
                </Button>
                <Button
                  variant={inputMode === 'url' ? 'primary' : 'outline'}
                  onClick={() => {
                    setInputMode('url');
                    setError(null);
                    setSelectedFile(null);
                  }}
                  className="flex-1"
                  style={inputMode === 'url' ? { backgroundColor: '#D5B667', color: '#000000' } : undefined}
                >
                  <LinkIcon size={18} className="mr-2" />
                  Importer depuis URL
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-arise-beige p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-arise-teal mb-2">Instructions :</h3>
                {inputMode === 'file' ? (
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Format accepté : PDF uniquement</li>
                    <li>• Taille maximale : 10MB</li>
                    <li>• Le fichier sera analysé avec l'intelligence artificielle pour extraire vos résultats</li>
                    <li>• Le processus peut prendre 10-30 secondes</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Collez l'URL de votre profil 16Personalities (ex: https://www.16personalities.com/profiles/6d65d1ec09592)</li>
                    <li>• Le système téléchargera automatiquement le PDF depuis cette URL</li>
                    <li>• Le PDF sera analysé avec l'intelligence artificielle pour extraire vos résultats</li>
                    <li>• Le processus peut prendre 15-45 secondes</li>
                  </ul>
                )}
              </div>

              {/* File Upload or URL Input */}
              {inputMode === 'file' ? (
                <div className="mb-6">
                  <FileUploadWithPreview
                    label="Sélectionner votre PDF"
                    accept="application/pdf,.pdf"
                    multiple={false}
                    onFileSelect={handleFileSelect}
                    maxSize={10}
                    helperText="Taille maximale : 10MB • Format : PDF uniquement"
                    fullWidth
                    error={error || undefined}
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de votre profil 16Personalities
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
                    Exemple : https://www.16personalities.com/profiles/6d65d1ec09592
                  </p>
                </div>
              )}

              {/* Selected File or URL Display */}
              {inputMode === 'file' && selectedFile && !isUploading && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">{selectedFile.name}</p>
                      <p className="text-sm text-green-700">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {inputMode === 'url' && profileUrl && validateProfileUrl(profileUrl) && !isUploading && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">URL valide</p>
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
                    PDF analysis may take a few moments...
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
                      <p className="text-sm text-red-700">{error}</p>
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
                    (inputMode === 'file' && !selectedFile) || 
                    (inputMode === 'url' && (!profileUrl.trim() || !validateProfileUrl(profileUrl))) ||
                    isUploading
                  }
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#D5B667', color: '#000000' }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {inputMode === 'url' ? 'Downloading and analyzing...' : 'Analysis in progress...'}
                    </>
                  ) : (
                    <>
                      {inputMode === 'url' ? <LinkIcon size={20} /> : <Upload size={20} />}
                      {inputMode === 'url' ? 'Importer depuis URL' : 'Analyser mon PDF'}
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
                Besoin d'aide ?
              </h3>
              <div className="space-y-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-2">Option 1 : Import depuis URL (Recommandé)</p>
                  <ol className="space-y-1 ml-4 list-decimal">
                    <li>Connectez-vous à votre compte sur <a href="https://www.16personalities.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">16Personalities</a></li>
                    <li>Allez sur votre page de profil (ex: https://www.16personalities.com/profiles/6d65d1ec09592)</li>
                    <li>Copiez l'URL complète depuis la barre d'adresse</li>
                    <li>Collez l'URL ici et cliquez sur "Importer depuis URL"</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium mb-2">Option 2 : Upload de fichier PDF</p>
                  <ol className="space-y-1 ml-4 list-decimal">
                    <li>Retournez sur <a href="https://www.16personalities.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">16Personalities</a></li>
                    <li>Connectez-vous à votre compte</li>
                    <li>Téléchargez votre PDF de résultats depuis votre profil</li>
                    <li>Revenez ici et uploadez le fichier PDF</li>
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
