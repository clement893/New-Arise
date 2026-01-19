'use client';

/**
 * MBTI Assessment Introduction Page
 * Redirects to 16personalities.com and allows PDF upload
 */

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MotionDiv from '@/components/motion/MotionDiv';
import { ArrowLeft, ExternalLink, Upload, Brain, FileText, CheckCircle } from 'lucide-react';

export default function MBTIAssessmentPage() {
  const router = useRouter();
  const t = useTranslations('assessments.mbti');
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
            variant="primary"
            onClick={() => router.push('/dashboard/assessments')}
            className="mb-6 flex items-center gap-4"
            style={{ backgroundColor: '#0F4C56', color: '#fff' }}
          >
            <ArrowLeft size={16} />
            {t('backToAssessments')}
          </Button>

          <div className="mb-8 pb-6">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">{t('pageTitle.prefix')} </span>
              <span style={{ color: '#D5B667' }}>{t('pageTitle.suffix')}</span>
            </h1>
            <p className="text-gray-600">
              {t('pageSubtitle')}
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
                    {t('title')}
                  </h2>
                  <p className="text-gray-600">
                    {t('description')}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-arise-beige p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-arise-teal mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  {t('howToProceed.title')}
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>{t('howToProceed.step1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>{t('howToProceed.step2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>{t('howToProceed.step3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-arise-gold text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <span>{t('howToProceed.step4')}</span>
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
                  {t('actions.takeTest')}
                </Button>

                {!showUploadOption ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadOption(true)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    {t('actions.completedTest')}
                  </Button>
                ) : (
                  <Card className="bg-arise-gold/10 border-2 border-arise-gold/30">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="text-arise-gold" size={24} />
                        <h3 className="font-semibold text-gray-900">{t('actions.readyToUpload')}</h3>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-arise-gold/30 mb-4">
                        <p className="font-medium text-gray-900 mb-2">{t('actions.factsheetInstructions.title')}</p>
                        <ol className="text-gray-700 text-sm space-y-1 ml-4 list-decimal">
                          <li>{t('actions.factsheetInstructions.step1')}</li>
                          <li>{t('actions.factsheetInstructions.step2')}</li>
                          <li>{t('actions.factsheetInstructions.step3')}</li>
                        </ol>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => router.push('/dashboard/assessments/mbti/upload')}
                        className="w-full flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#D5B667', color: '#000000' }}
                      >
                        <Upload size={20} />
                        {t('actions.uploadPDF')}
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
              <h3 className="font-semibold text-arise-teal mb-3">{t('aboutMBTI.title')}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium mb-2">{t('aboutMBTI.fourDimensions.title')}</h4>
                  <ul className="space-y-1">
                    <li>• <strong>{t('aboutMBTI.fourDimensions.energy.code')}</strong>: {t('aboutMBTI.fourDimensions.energy.description')}</li>
                    <li>• <strong>{t('aboutMBTI.fourDimensions.information.code')}</strong>: {t('aboutMBTI.fourDimensions.information.description')}</li>
                    <li>• <strong>{t('aboutMBTI.fourDimensions.decisions.code')}</strong>: {t('aboutMBTI.fourDimensions.decisions.description')}</li>
                    <li>• <strong>{t('aboutMBTI.fourDimensions.lifestyle.code')}</strong>: {t('aboutMBTI.fourDimensions.lifestyle.description')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{t('aboutMBTI.personalityType.title')}</h4>
                  <p>
                    {t('aboutMBTI.personalityType.description')}
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
