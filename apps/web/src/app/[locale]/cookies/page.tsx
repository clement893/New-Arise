'use client';

import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Cookie, Settings, BarChart, Target } from 'lucide-react';

export default function CookiePolicyPage() {
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
                Cookie Policy
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Learn about how we use cookies and similar technologies on our platform.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
        </MotionDiv>

        <div className="space-y-8">
          {/* What Are Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p className="text-gray-700">
              Cookies allow a website to recognize your device and store some information about your preferences or past actions. This helps us provide you with a better experience when you browse our platform.
            </p>
          </Card>

          {/* Types of Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="text-arise-deep-teal" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">1. Essential Cookies</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li>Authentication cookies (to keep you logged in)</li>
                    <li>Session cookies (to maintain your session)</li>
                    <li>Security cookies (to protect against fraud)</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3 italic">
                    These cookies cannot be disabled as they are essential for the Service to function.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BarChart className="text-arise-deep-teal" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">2. Analytics Cookies</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li>Google Analytics cookies (to track page views and user behavior)</li>
                    <li>Performance monitoring cookies (to identify technical issues)</li>
                    <li>Usage statistics cookies (to improve our services)</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    These cookies help us improve our website and services by understanding how they are used.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Target className="text-arise-deep-teal" size={20} />
                  <h3 className="text-xl font-semibold text-gray-900">3. Marketing Cookies</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies are used to track visitors across websites to display relevant advertisements and measure the effectiveness of our marketing campaigns.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li>Advertising cookies (to show relevant ads)</li>
                    <li>Social media cookies (to enable social sharing)</li>
                    <li>Retargeting cookies (to remind you of our services)</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    These cookies require your consent and can be managed through your cookie preferences.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Cookie Table */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Cookie Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Purpose</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Duration</th>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide enhanced functionality.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Analytics</h3>
                <p className="text-gray-700 text-sm">
                  We use Google Analytics to understand how visitors use our website. For more information, please visit{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-arise-deep-teal hover:underline">
                    Google's Privacy Policy
                  </a>.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Processors</h3>
                <p className="text-gray-700 text-sm">
                  When you make a payment, our payment processors may set cookies to process your transaction securely.
                </p>
              </div>
            </div>
          </Card>

          {/* Managing Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
                <p className="text-gray-700 mb-3">
                  Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or to alert you when cookies are being sent.
                </p>
                <p className="text-gray-700 text-sm mb-2">Here's how to manage cookies in popular browsers:</p>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookie Preferences</h3>
                <p className="text-gray-700 mb-3">
                  You can manage your cookie preferences directly on our platform through the cookie settings panel, which appears when you first visit our website or can be accessed at any time through your account settings.
                </p>
                <p className="text-gray-700 text-sm">
                  Note: Disabling certain cookies may affect the functionality of the Service. Essential cookies cannot be disabled as they are necessary for the Service to function.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Opt-Out Links</h3>
                <p className="text-gray-700 mb-3">You can opt out of certain third-party cookies:</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Do Not Track Signals</h2>
            <p className="text-gray-700">
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your online activity tracked. Currently, there is no standard for how DNT signals should be interpreted. As a result, we do not currently respond to DNT browser signals or mechanisms.
            </p>
          </Card>

          {/* Updates */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Cookie Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-gray-700">
              We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-arise-deep-teal/5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:privacy@arise.com" className="text-arise-deep-teal hover:underline">privacy@arise.com</a></p>
              <p><strong>Address:</strong> ARISE Human Capital, [Address], [City], [Country]</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
