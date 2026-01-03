'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Cookie, Settings, BarChart, Target } from 'lucide-react';

export default function CookiePolicyPage() {
  const t = useTranslations('cookies');
  const lastUpdated = 'January 2024';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="text-arise-deep-teal" size={32} />
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
          {/* What Are Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('whatAreCookies.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('whatAreCookies.text1')}
            </p>
            <p className="text-gray-700">
              {t('whatAreCookies.text2')}
            </p>
          </Card>

          {/* Types of Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('types.title')}</h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="text-arise-deep-teal" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">{t('types.essential.title')}</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  {t('types.essential.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{t('types.essential.examples')}</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    {t.raw('types.essential.items').map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-3 italic">
                    {t('types.essential.note')}
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BarChart className="text-arise-deep-teal" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">{t('types.analytics.title')}</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  {t('types.analytics.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{t('types.analytics.examples')}</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    {t.raw('types.analytics.items').map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    {t('types.analytics.note')}
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Target className="text-arise-deep-teal" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">{t('types.marketing.title')}</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  {t('types.marketing.description')}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{t('types.marketing.examples')}</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    {t.raw('types.marketing.items').map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    {t('types.marketing.note')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Cookie Table */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookieTable.title')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookieTable.cookieName')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookieTable.purpose')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookieTable.type')}</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('cookieTable.duration')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-mono">session_id</td>
                    <td className="py-3 px-4">Maintains user session</td>
                    <td className="py-3 px-4">Essential</td>
                    <td className="py-3 px-4">Session</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-mono">auth_token</td>
                    <td className="py-3 px-4">User authentication</td>
                    <td className="py-3 px-4">Essential</td>
                    <td className="py-3 px-4">30 days</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-mono">_ga</td>
                    <td className="py-3 px-4">Google Analytics tracking</td>
                    <td className="py-3 px-4">Analytics</td>
                    <td className="py-3 px-4">2 years</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-mono">_gid</td>
                    <td className="py-3 px-4">Google Analytics tracking</td>
                    <td className="py-3 px-4">Analytics</td>
                    <td className="py-3 px-4">24 hours</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-mono">cookie_consent</td>
                    <td className="py-3 px-4">Stores cookie preferences</td>
                    <td className="py-3 px-4">Essential</td>
                    <td className="py-3 px-4">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Third-Party Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('thirdParty.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('thirdParty.text')}
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('thirdParty.googleAnalytics.title')}</h3>
                <p className="text-gray-700 text-sm">
                  {t('thirdParty.googleAnalytics.text')}{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-arise-deep-teal hover:underline">
                    Google's Privacy Policy
                  </a>.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('thirdParty.paymentProcessors.title')}</h3>
                <p className="text-gray-700 text-sm">
                  {t('thirdParty.paymentProcessors.text')}
                </p>
              </div>
            </div>
          </Card>

          {/* Managing Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('managingCookies.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('managingCookies.browserSettings.title')}</h3>
                <p className="text-gray-700 mb-3">
                  {t('managingCookies.browserSettings.text')}
                </p>
                <p className="text-gray-700 text-sm mb-2">{t('managingCookies.browserSettings.instructions')}</p>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                  {t.raw('managingCookies.browserSettings.items').map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('managingCookies.cookiePreferences.title')}</h3>
                <p className="text-gray-700 mb-3">
                  {t('managingCookies.cookiePreferences.text1')}
                </p>
                <p className="text-gray-700 text-sm">
                  {t('managingCookies.cookiePreferences.text2')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('managingCookies.optOutLinks.title')}</h3>
                <p className="text-gray-700 mb-3">{t('managingCookies.optOutLinks.text')}</p>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                  <li>
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-arise-deep-teal hover:underline">
                      Google Analytics Opt-out
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-arise-deep-teal hover:underline">
                      Your Online Choices (EU)
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Do Not Track */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('doNotTrack.title')}</h2>
            <p className="text-gray-700">
              {t('doNotTrack.text')}
            </p>
          </Card>

          {/* Updates */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('updates.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('updates.text1')}
            </p>
            <p className="text-gray-700">
              {t('updates.text2')}
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-arise-deep-teal/5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contact.title')}</h2>
            <p className="text-gray-700 mb-4">
              {t('contact.text')}
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>{t('contact.email')}</strong> <a href="mailto:privacy@arise.com" className="text-arise-deep-teal hover:underline">privacy@arise.com</a></p>
              <p><strong>{t('contact.address')}</strong> ARISE Human Capital, [Address], [City], [Country]</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
