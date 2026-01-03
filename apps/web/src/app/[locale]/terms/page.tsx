'use client';

import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { FileText, Scale, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = 'January 2024';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-arise-deep-teal" size={32} />
              <h1 className="text-4xl font-bold text-gray-900">
                Terms of Service
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Please read these terms carefully before using our services.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
        </MotionDiv>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using the ARISE Human Capital platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-gray-700">
              These Terms apply to all users of the Service, including without limitation users who are browsers, vendors, customers, merchants, and contributors of content.
            </p>
          </Card>

          {/* Description of Service */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">2. Description of Service</h2>
            </div>
            <p className="text-gray-700 mb-4">
              ARISE provides a comprehensive leadership development platform that includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Personality and behavioral assessments (MBTI, TKI, 360° Feedback, Wellness)</li>
              <li>Personalized leadership profiles and insights</li>
              <li>Development plans and recommendations</li>
              <li>Coaching services and resources</li>
              <li>Progress tracking and reporting tools</li>
            </ul>
          </Card>

          {/* User Accounts */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Account Creation</h3>
                <p className="text-gray-700">
                  To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Account Security</h3>
                <p className="text-gray-700">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3 Account Termination</h3>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason we deem necessary.
                </p>
              </div>
            </div>
          </Card>

          {/* Use of Service */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Use of Service</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Permitted Use</h3>
                <p className="text-gray-700 mb-2">You may use the Service for lawful purposes only. You agree to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Use the Service in accordance with all applicable laws and regulations</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Respect the rights of other users</li>
                  <li>Maintain the security of your account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Prohibited Activities</h3>
                <p className="text-gray-700 mb-2">You agree not to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit any harmful code, viruses, or malicious software</li>
                  <li>Attempt to gain unauthorized access to the Service or related systems</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Use the Service for any fraudulent or deceptive purpose</li>
                  <li>Copy, modify, or create derivative works of the Service</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Intellectual Property */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Our Rights</h3>
                <p className="text-gray-700">
                  The Service and its original content, features, and functionality are owned by ARISE Human Capital and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Your Content</h3>
                <p className="text-gray-700 mb-2">
                  You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of providing and improving the Service.
                </p>
                <p className="text-gray-700">
                  You represent and warrant that you have all necessary rights to grant this license and that your content does not violate any third-party rights.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5.3 Assessment Results</h3>
                <p className="text-gray-700">
                  Assessment results and reports generated through the Service are your property. However, we may use anonymized and aggregated data for research, analytics, and service improvement purposes.
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.1 Subscription Fees</h3>
                <p className="text-gray-700">
                  Some features of the Service may require payment of subscription fees. Fees are billed in advance on a monthly or annual basis and are non-refundable except as required by law.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.2 Price Changes</h3>
                <p className="text-gray-700">
                  We reserve the right to change our pricing at any time. We will provide notice of price changes at least 30 days in advance. Continued use of the Service after a price change constitutes acceptance of the new pricing.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.3 Refunds</h3>
                <p className="text-gray-700">
                  Refunds are provided at our sole discretion and in accordance with applicable law. If you are not satisfied with the Service, please contact us to discuss refund options.
                </p>
              </div>
            </div>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">7.1 Disclaimer</h3>
                <p className="text-gray-700 mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="text-gray-700">
                  We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">7.2 Limitation of Liability</h3>
                <p className="text-gray-700 mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, ARISE HUMAN CAPITAL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                </p>
                <p className="text-gray-700">
                  Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">7.3 Assessment Results</h3>
                <p className="text-gray-700">
                  Assessment results and recommendations are provided for informational and developmental purposes only. They should not be used as the sole basis for employment, promotion, or other personnel decisions. We are not responsible for decisions made based on assessment results.
                </p>
              </div>
            </div>
          </Card>

          {/* Indemnification */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless ARISE Human Capital and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your use of the Service, violation of these Terms, or infringement of any rights of another.
            </p>
          </Card>

          {/* Termination */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">9.1 Termination by You</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">9.2 Termination by Us</h3>
                <p className="text-gray-700">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">9.3 Effect of Termination</h3>
                <p className="text-gray-700">
                  Upon termination, your right to use the Service will immediately cease. We may delete your account and data, subject to our data retention policies and legal obligations.
                </p>
              </div>
            </div>
          </Card>

          {/* Governing Law */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in [Jurisdiction].
            </p>
          </Card>

          {/* Changes to Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            <p className="text-gray-700">
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use the Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </Card>

          {/* Severability */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.
            </p>
          </Card>

          {/* Entire Agreement */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Entire Agreement</h2>
            <p className="text-gray-700">
              These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and ARISE Human Capital regarding the use of the Service and supersede all prior agreements and understandings.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-arise-deep-teal/5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:legal@arise.com" className="text-arise-deep-teal hover:underline">legal@arise.com</a></p>
              <p><strong>Address:</strong> ARISE Human Capital, [Address], [City], [Country]</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
