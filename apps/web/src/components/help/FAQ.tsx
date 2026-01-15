/**
 * FAQ Component
 * 
 * Displays frequently asked questions in an accordion format.
 * 
 * @component
 */

'use client';

import { Accordion } from '@/components/ui';
import type { AccordionItem } from '@/components/ui';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQProps {
  faqs?: FAQItem[];
  className?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I get started with ARISE?',
    answer: 'To get started with ARISE, simply create an account by clicking "Get Started" or "Sign Up". Once registered, you\'ll have access to your dashboard where you can start MBTI, TKI, 360°, and Wellness assessments. Follow the getting started guide for a better understanding of the platform.',
    category: 'Getting Started',
  },
  {
    id: '2',
    question: 'What is the MBTI assessment?',
    answer: 'The Myers-Briggs Type Indicator (MBTI) is a personality assessment that helps you understand your natural preferences and how you interact with the world. It identifies your personality type among 16 possible types, giving you insights into your strengths and leadership style.',
    category: 'Assessments',
  },
  {
    id: '3',
    question: 'How does the 360° assessment work?',
    answer: 'The 360° assessment allows you to get comprehensive feedback from your colleagues, managers, and direct reports. You can invite evaluators who know you well in different professional contexts. This feedback will give you a complete view of your leadership impact from all angles.',
    category: 'Assessments',
  },
  {
    id: '4',
    question: 'Can I modify my answers after submitting an assessment?',
    answer: 'Once an assessment is submitted, you cannot modify your answers. However, you can complete a new assessment at any time to track your progress. We recommend retaking assessments every 6 to 12 months to see your progression.',
    category: 'Assessments',
  },
  {
    id: '5',
    question: 'How do I access my reports?',
    answer: 'Once you have completed an assessment, your reports are automatically generated and available in your dashboard. You can view them, download as PDF, or share them with your coach or manager.',
    category: 'Reports',
  },
  {
    id: '6',
    question: 'What is the difference between Individual, Coach, and Enterprise plans?',
    answer: 'The Individual plan is perfect for leaders looking to develop their personal skills. The Coach plan allows you to manage multiple clients and access client reports. The Enterprise plan offers team assessments, organization-wide insights, and dedicated support.',
    category: 'Plans and Pricing',
  },
  {
    id: '7',
    question: 'How can I reset my password?',
    answer: 'You can reset your password by clicking "Forgot Password" on the login page. You will receive an email with instructions to reset your password. If you don\'t receive the email, check your spam folder.',
    category: 'Account',
  },
  {
    id: '8',
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes, you can cancel your subscription at any time from the billing settings page in your profile. Your access will continue until the end of your current billing period. After cancellation, you retain access to your previous reports.',
    category: 'Billing',
  },
  {
    id: '9',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards. Payments are processed securely through our payment platform. For Enterprise plans, we also offer invoices and bank transfers.',
    category: 'Billing',
  },
  {
    id: '10',
    question: 'How can I contact support?',
    answer: 'You can contact our support team by visiting the "Contact Support" page in the help center, or by creating a support ticket from your dashboard. Our team typically responds within 24 business hours.',
    category: 'Support',
  },
  {
    id: '11',
    question: 'Is my data secure?',
    answer: 'Absolutely. We take the security of your data very seriously. All data is encrypted in transit and at rest. We comply with GDPR standards and never share your information with third parties without your explicit consent.',
    category: 'Security and Privacy',
  },
  {
    id: '12',
    question: 'Can I share my results with my coach?',
    answer: 'Yes, you can share your reports with your coach by giving them access or by downloading your reports as PDF. Coaches registered on ARISE can also have direct access to their clients\' reports if they use the Coach plan.',
    category: 'Sharing and Collaboration',
  },
];

/**
 * FAQ Component
 * 
 * Displays FAQ items in an accordion format.
 */
export default function FAQ({
  faqs = defaultFAQs,
  className,
}: FAQProps) {
  const accordionItems: AccordionItem[] = faqs.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: faq.answer,
  }));

  return (
    <div className={className}>
      <Accordion items={accordionItems} />
    </div>
  );
}
