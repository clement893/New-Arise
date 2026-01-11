'use client';

/**
 * MBTI Assessment Introduction Page
 * Redirects to 16personalities.com and allows PDF upload
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import { ArrowLeft, ExternalLink, Upload, Brain, FileText, CheckCircle } from 'lucide-react';

export default function MBTIAssessmentPage() {
  const router = useRouter();
  const [showUploadOption, setShowUploadOption] = useState(false);

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
            onClick={() => router.push('/dashboard/assessments')}
            className="mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour aux assessments
          </Button>

          <div className="mb-8 pb-6">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">Test MBTI - </span>
              <span style={{ color: '#D5B667' }}>Personnalité</span>
            </h1>
            <p className="text-gray-600">
              Découvrez votre type de personnalité à travers 4 dimensions
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-8">
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e7eeef' }}>
                  <Brain className="text-arise-deep-teal" size={40} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    MBTI Personality Assessment
                  </h2>
                  <p className="text-gray-600">
                    Le Myers-Briggs Type Indicator (MBTI) est un outil de développement personnel 
                    qui identifie votre type de personnalité selon 4 dimensions principales.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-arise-beige p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-arise-teal mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Comment procéder ?
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Cliquez sur le bouton ci-dessous pour accéder au test sur 16Personalities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Complétez le test sur leur plateforme (environ 10-15 minutes)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Téléchargez votre PDF de résultats depuis 16Personalities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>Revenez ici et uploadez votre PDF pour voir vos résultats dans ARISE</span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  variant="primary"
                  onClick={() => window.open('https://www.16personalities.com/free-personality-test', '_blank')}
                  className="w-full flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#D5B667', color: '#000000' }}
                >
                  <ExternalLink size={20} />
                  Take the test on 16Personalities
                </Button>

                {!showUploadOption ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadOption(true)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    I've completed the test, upload my PDF
                  </Button>
                ) : (
                  <Card className="bg-arise-gold/10 border-2 border-arise-gold/30">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="text-arise-gold" size={24} />
                        <h3 className="font-semibold text-gray-900">Ready to upload your PDF?</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Make sure you've downloaded your results PDF from 16Personalities, 
                        then click the button below to upload it.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => router.push('/dashboard/assessments/mbti/upload')}
                        className="w-full flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#D5B667', color: '#000000' }}
                      >
                        <Upload size={20} />
                        Upload my results PDF
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Card>

          {/* Information Card */}
          <Card className="bg-arise-teal/10 border-2 border-arise-teal/30">
            <div className="p-6">
              <h3 className="font-semibold text-arise-teal mb-3">À propos du MBTI</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium mb-2">Les 4 dimensions :</h4>
                  <ul className="space-y-1">
                    <li>• <strong>E/I</strong> : Extraversion / Introversion</li>
                    <li>• <strong>S/N</strong> : Sensation / Intuition</li>
                    <li>• <strong>T/F</strong> : Pensée / Sentiment</li>
                    <li>• <strong>J/P</strong> : Jugement / Perception</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Votre type de personnalité :</h4>
                  <p>
                    Une combinaison de ces 4 dimensions donne naissance à 16 types de personnalité 
                    uniques (INTJ, ENFP, ESTJ, etc.), chacun avec ses propres forces et préférences.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}
