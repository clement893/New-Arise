'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { FileText, Scale, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const t = useTranslations('terms');
  const lastUpdated = 'January 2024';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-arise-deep-teal" size={32} />
              <h1 className="text-4xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              {t('subtitle')}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('lastUpdated')}: {lastUpdated}
            </p>
          </div>
        </MotionDiv>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('acceptance.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('acceptance.text1')}
            </p>
            <p className="text-gray-700">
              {t('acceptance.text2')}
            </p>
          </Card>

          {/* Description of Service */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{t('description.title')}</h2>
            </div>
            <p className="text-gray-700 mb-4">
              {t('description.text')}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              {t.raw('description.items').map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </Card>

          {/* User Accounts */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('userAccounts.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('userAccounts.accountCreation.title')}</h3>
                <p className="text-gray-700">
                  {t('userAccounts.accountCreation.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('userAccounts.accountSecurity.title')}</h3>
                <p className="text-gray-700">
                  {t('userAccounts.accountSecurity.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('userAccounts.accountTermination.title')}</h3>
                <p className="text-gray-700">
                  {t('userAccounts.accountTermination.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* Use of Service */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('useOfService.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('useOfService.permittedUse.title')}</h3>
                <p className="text-gray-700 mb-2">{t('useOfService.permittedUse.text')}</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  {t.raw('useOfService.permittedUse.items').map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('useOfService.prohibitedActivities.title')}</h3>
                <p className="text-gray-700 mb-2">{t('useOfService.prohibitedActivities.text')}</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  {t.raw('useOfService.prohibitedActivities.items').map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Intellectual Property */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('intellectualProperty.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('intellectualProperty.ourRights.title')}</h3>
                <p className="text-gray-700">
                  {t('intellectualProperty.ourRights.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('intellectualProperty.yourContent.title')}</h3>
                <p className="text-gray-700 mb-2">
                  {t('intellectualProperty.yourContent.text1')}
                </p>
                <p className="text-gray-700">
                  {t('intellectualProperty.yourContent.text2')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('intellectualProperty.assessmentResults.title')}</h3>
                <p className="text-gray-700">
                  {t('intellectualProperty.assessmentResults.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('paymentTerms.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('paymentTerms.subscriptionFees.title')}</h3>
                <p className="text-gray-700">
                  {t('paymentTerms.subscriptionFees.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('paymentTerms.priceChanges.title')}</h3>
                <p className="text-gray-700">
                  {t('paymentTerms.priceChanges.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('paymentTerms.refunds.title')}</h3>
                <p className="text-gray-700">
                  {t('paymentTerms.refunds.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{t('limitationOfLiability.title')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('limitationOfLiability.disclaimer.title')}</h3>
                <p className="text-gray-700 mb-4">
                  {t('limitationOfLiability.disclaimer.text1')}
                </p>
                <p className="text-gray-700">
                  {t('limitationOfLiability.disclaimer.text2')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('limitationOfLiability.limitation.title')}</h3>
                <p className="text-gray-700 mb-4">
                  {t('limitationOfLiability.limitation.text1')}
                </p>
                <p className="text-gray-700">
                  {t('limitationOfLiability.limitation.text2')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('limitationOfLiability.assessmentResults.title')}</h3>
                <p className="text-gray-700">
                  {t('limitationOfLiability.assessmentResults.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* Indemnification */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('indemnification.title')}</h2>
            <p className="text-gray-700">
              {t('indemnification.text')}
            </p>
          </Card>

          {/* Termination */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('termination.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('termination.byYou.title')}</h3>
                <p className="text-gray-700">
                  {t('termination.byYou.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('termination.byUs.title')}</h3>
                <p className="text-gray-700">
                  {t('termination.byUs.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('termination.effect.title')}</h3>
                <p className="text-gray-700">
                  {t('termination.effect.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* Governing Law */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('governingLaw.title')}</h2>
            <p className="text-gray-700">
              {t('governingLaw.text')}
            </p>
          </Card>

          {/* Changes to Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('changesToTerms.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('changesToTerms.text1')}
            </p>
            <p className="text-gray-700">
              {t('changesToTerms.text2')}
            </p>
          </Card>

          {/* Severability */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('severability.title')}</h2>
            <p className="text-gray-700">
              {t('severability.text')}
            </p>
          </Card>

          {/* Entire Agreement */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('entireAgreement.title')}</h2>
            <p className="text-gray-700">
              {t('entireAgreement.text')}
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-arise-deep-teal/5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contact.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('contact.text')}
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>{t('contact.email')}</strong> <a href="mailto:legal@arise.com" className="text-arise-deep-teal hover:underline">legal@arise.com</a></p>
              <p><strong>{t('contact.address')}</strong> ARISE Human Capital, [Address], [City], [Country]</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
