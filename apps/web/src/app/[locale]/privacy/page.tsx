'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacy');
  const lastUpdated = 'January 2024';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-arise-deep-teal" size={32} />
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
          {/* Introduction */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('introduction.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('introduction.text1')}
            </p>
            <p className="text-gray-700">
              {t('introduction.text2')}
            </p>
          </Card>

          {/* Information We Collect */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{t('informationWeCollect.title')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('informationWeCollect.personalInfo.title')}</h3>
                <p className="text-gray-700 mb-2">{t('informationWeCollect.personalInfo.text')}</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  {t.raw('informationWeCollect.personalInfo.items').map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('informationWeCollect.usageInfo.title')}</h3>
                <p className="text-gray-700 mb-2">{t('informationWeCollect.usageInfo.text')}</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  {t.raw('informationWeCollect.usageInfo.items').map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('informationWeCollect.assessmentData.title')}</h3>
                <p className="text-gray-700">
                  {t('informationWeCollect.assessmentData.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{t('howWeUse.title')}</h2>
            </div>
            
            <p className="text-gray-700 mb-4">{t('howWeUse.text')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              {t.raw('howWeUse.items').map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </Card>

          {/* Information Sharing */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('informationSharing.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('informationSharing.serviceProviders.title')}</h3>
                <p className="text-gray-700">
                  {t('informationSharing.serviceProviders.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('informationSharing.businessTransfers.title')}</h3>
                <p className="text-gray-700">
                  {t('informationSharing.businessTransfers.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('informationSharing.legalRequirements.title')}</h3>
                <p className="text-gray-700">
                  {t('informationSharing.legalRequirements.text')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('informationSharing.withYourConsent.title')}</h3>
                <p className="text-gray-700">
                  {t('informationSharing.withYourConsent.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* Your Rights */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('yourRights.title')}</h2>
            
            <p className="text-gray-700 mb-4">{t('yourRights.text')}</p>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              {t.raw('yourRights.items').map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <p className="text-gray-700 mt-4">
              {t('yourRights.contact')} <a href="mailto:privacy@arisehumancapital.com" className="text-arise-deep-teal hover:underline">privacy@arisehumancapital.com</a>.
            </p>
          </Card>

          {/* Data Security */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{t('dataSecurity.title')}</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              {t('dataSecurity.text')}
            </p>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              {t.raw('dataSecurity.items').map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <p className="text-gray-700 mt-4">
              {t('dataSecurity.disclaimer')}
            </p>
          </Card>

          {/* Data Retention */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dataRetention.title')}</h2>
            <p className="text-gray-700">
              {t('dataRetention.text')}
            </p>
          </Card>

          {/* Cookies */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('cookies.text')} <Link href="/cookies" className="text-arise-deep-teal hover:underline">{t('cookies.title')}</Link>.
            </p>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('childrensPrivacy.title')}</h2>
            <p className="text-gray-700">
              {t('childrensPrivacy.text')}
            </p>
          </Card>

          {/* International Transfers */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('internationalTransfers.title')}</h2>
            <p className="text-gray-700">
              {t('internationalTransfers.text')}
            </p>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('changesToPolicy.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('changesToPolicy.text1')}
            </p>
            <p className="text-gray-700">
              {t('changesToPolicy.text2')}
            </p>
          </Card>

          {/* Contact */}
          <Card className="bg-arise-deep-teal/5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contact.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('contact.text')}
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>{t('contact.email')}</strong> <a href="mailto:privacy@arisehumancapital.com" className="text-arise-deep-teal hover:underline">privacy@arisehumancapital.com</a></p>
              <p><strong>{t('contact.dpo')}</strong> <a href="mailto:dpo@arisehumancapital.com" className="text-arise-deep-teal hover:underline">dpo@arisehumancapital.com</a></p>
              <p><strong>{t('contact.address')}</strong> ARISE Human Capital, 4835 Av Borden, Montreal, Quebec, Canada, H4V 2S9</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
