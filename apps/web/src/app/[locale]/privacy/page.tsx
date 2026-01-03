'use client';

import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 2024';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-arise-deep-teal" size={32} />
              <h1 className="text-4xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
        </MotionDiv>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              ARISE Human Capital ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>
            <p className="text-gray-700">
              By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </Card>

          {/* Information We Collect */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.1 Personal Information</h3>
                <p className="text-gray-700 mb-2">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information (job title, organization, preferences)</li>
                  <li>Assessment responses and results</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.2 Usage Information</h3>
                <p className="text-gray-700 mb-2">We automatically collect certain information when you use our services:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, features used)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.3 Assessment Data</h3>
                <p className="text-gray-700">
                  We collect and store your assessment responses, results, and progress data to provide you with personalized insights and development recommendations.
                </p>
              </div>
            </div>
          </Card>

          {/* How We Use Your Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
            </div>
            
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your assessments and generate personalized reports</li>
              <li>Communicate with you about your account, assessments, and services</li>
              <li>Send you updates, newsletters, and marketing communications (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </Card>

          {/* Information Sharing */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Service Providers</h3>
                <p className="text-gray-700">
                  We may share your information with third-party service providers who perform services on our behalf, such as hosting, analytics, payment processing, and customer support. These providers are contractually obligated to protect your information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Business Transfers</h3>
                <p className="text-gray-700">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3 Legal Requirements</h3>
                <p className="text-gray-700">
                  We may disclose your information if required by law or in response to valid legal requests, such as court orders or government investigations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.4 With Your Consent</h3>
                <p className="text-gray-700">
                  We may share your information with your explicit consent or at your direction, such as when you choose to share assessment results with coaches or colleagues.
                </p>
              </div>
            </div>
          </Card>

          {/* Your Rights */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your Rights (GDPR Compliance)</h2>
            
            <p className="text-gray-700 mb-4">Under the General Data Protection Regulation (GDPR) and other applicable laws, you have the following rights:</p>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>

            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at <a href="mailto:privacy@arise.com" className="text-arise-deep-teal hover:underline">privacy@arise.com</a>.
            </p>
          </Card>

          {/* Data Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-arise-deep-teal" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">5. Data Security</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection</li>
              <li>Secure data centers and infrastructure</li>
            </ul>

            <p className="text-gray-700 mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </Card>

          {/* Data Retention */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal data, except where we are required to retain it for legal or legitimate business purposes.
            </p>
          </Card>

          {/* Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist with marketing efforts. For detailed information about our use of cookies, please see our <a href="/cookies" className="text-arise-deep-teal hover:underline">Cookie Policy</a>.
            </p>
          </Card>

          {/* Children's Privacy */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </Card>

          {/* International Transfers */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws.
            </p>
          </Card>

          {/* Changes to Policy */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-gray-700">
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-arise-deep-teal/5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:privacy@arise.com" className="text-arise-deep-teal hover:underline">privacy@arise.com</a></p>
              <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@arise.com" className="text-arise-deep-teal hover:underline">dpo@arise.com</a></p>
              <p><strong>Address:</strong> ARISE Human Capital, [Address], [City], [Country]</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
