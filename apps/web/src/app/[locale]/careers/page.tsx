'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import MotionDiv from '@/components/motion/MotionDiv';
import { Briefcase, MapPin, Clock, DollarSign, Users, Heart, Zap, Award, ArrowRight, Plus } from 'lucide-react';

export default function CareersPage() {
  const t = useTranslations('careers');

// Job listings - to be replaced with real data or API
const openPositions = [
  {
    id: 1,
    title: 'Senior Full-Stack Developer',
    department: 'Engineering',
    location: 'Remote / New York, NY',
    type: 'Full-time',
    posted: '2 days ago',
    description: 'We are looking for an experienced full-stack developer to join our engineering team and help build the next generation of leadership assessment tools.',
    requirements: [
      '5+ years of experience with React and Node.js',
      'Experience with TypeScript and Next.js',
      'Strong understanding of database design',
      'Experience with cloud platforms (AWS, Railway, etc.)',
    ],
  },
  {
    id: 2,
    title: 'Leadership Assessment Specialist',
    department: 'Product',
    location: 'Remote / San Francisco, CA',
    type: 'Full-time',
    posted: '1 week ago',
    description: 'Join our product team to help design and improve our assessment tools, ensuring they provide valuable insights to leaders.',
    requirements: [
      'Background in psychology or organizational behavior',
      'Experience with psychometric assessments',
      'Strong analytical skills',
      'Excellent communication abilities',
    ],
  },
  {
    id: 3,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    posted: '3 days ago',
    description: 'Help our customers achieve their leadership development goals by providing exceptional support and guidance.',
    requirements: [
      '3+ years in customer success or account management',
      'Experience with B2B SaaS platforms',
      'Strong problem-solving skills',
      'Passion for leadership development',
    ],
  },
];

  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const benefitsList = [
    { icon: DollarSign, key: 'competitiveSalary' },
    { icon: Heart, key: 'healthWellness' },
    { icon: Zap, key: 'flexibleWork' },
    { icon: Users, key: 'teamCulture' },
    { icon: Award, key: 'professionalGrowth' },
    { icon: Clock, key: 'workLifeBalance' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-12 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Briefcase className="text-arise-deep-teal" size={40} />
              <h1 className="text-5xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </MotionDiv>

        {/* Why Work With Us */}
        <div className="mb-16">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-arise-deep-teal/5 to-white">
            <MotionDiv variant="fade" duration="normal">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('whyWorkWithUs.title')}</h2>
            </MotionDiv>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefitsList.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <MotionDiv key={index} variant="slideUp" delay={index * 50}>
                    <Card className="p-6 h-full">
                      <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="text-arise-deep-teal" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`benefits.${benefit.key}.title`)}</h3>
                      <p className="text-gray-600">{t(`benefits.${benefit.key}.description`)}</p>
                    </Card>
                  </MotionDiv>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('openPositions.title')}</h2>
          </MotionDiv>

          <div className="space-y-6">
            {openPositions.map((job, index) => (
              <MotionDiv key={job.id} variant="slideUp" delay={index * 100}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Briefcase size={16} />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={16} />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={16} />
                              {job.type}
                            </span>
                            <span className="text-gray-500">Posted {job.posted}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{job.description}</p>
                      
                      {selectedJob === job.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                            {job.requirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 md:flex-shrink-0">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                        className="whitespace-nowrap"
                      >
                        {selectedJob === job.id ? 'Hide Details' : 'View Details'}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setShowApplicationForm(true)}
                        className="!bg-arise-deep-teal hover:!bg-arise-deep-teal/90 !text-white whitespace-nowrap"
                      >
                        {t('applicationForm.submit')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </MotionDiv>
            ))}
          </div>

          {openPositions.length === 0 && (
            <Card className="p-12 text-center">
              <Briefcase className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noPositions.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('noPositions.text')}
              </p>
              <Button
                variant="primary"
                onClick={() => setShowApplicationForm(true)}
                className="!bg-arise-deep-teal hover:!bg-arise-deep-teal/90 !text-white"
              >
                {t('noPositions.submitApplication')}
              </Button>
            </Card>
          )}
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{t('applicationForm.title')}</h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('applicationForm.firstName')} *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('applicationForm.lastName')} *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('applicationForm.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('applicationForm.position')} *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                    >
                      <option value="">{t('applicationForm.selectPosition')}</option>
                      {openPositions.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                      <option value="general">{t('applicationForm.generalApplication')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('applicationForm.resume')} *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Plus className="text-gray-400 mx-auto mb-2" size={24} />
                      <p className="text-sm text-gray-600 mb-2">
                        {t('applicationForm.dropFile')}
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="inline-block px-4 py-2 bg-arise-deep-teal text-white rounded-lg cursor-pointer hover:bg-arise-deep-teal/90"
                      >
                        {t('applicationForm.chooseFile')}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('applicationForm.coverLetter')}
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent resize-none"
                      placeholder="Tell us why you're interested in joining ARISE..."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      className="!bg-arise-deep-teal hover:!bg-arise-deep-teal/90 !text-white flex items-center gap-2"
                    >
                      {t('applicationForm.submit')}
                      <ArrowRight size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      {t('applicationForm.cancel')}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}

        {/* Culture Section */}
        <div className="mb-16">
          <Card className="p-8 md:p-12">
            <MotionDiv variant="fade" duration="normal">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('culture.title')}</h2>
            </MotionDiv>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('culture.missionDriven.title')}</h3>
                <p className="text-gray-700">
                  {t('culture.missionDriven.text')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('culture.collaborative.title')}</h3>
                <p className="text-gray-700">
                  {t('culture.collaborative.text')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('culture.innovative.title')}</h3>
                <p className="text-gray-700">
                  {t('culture.innovative.text')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('culture.inclusive.title')}</h3>
                <p className="text-gray-700">
                  {t('culture.inclusive.text')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <MotionDiv variant="fade" duration="normal">
          <Card className="p-8 md:p-12 bg-gradient-to-r from-arise-deep-teal to-arise-deep-teal/90 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Button
              variant="secondary"
              onClick={() => setShowApplicationForm(true)}
              className="!bg-arise-gold hover:!bg-arise-gold/90 !text-arise-deep-teal font-semibold px-8 py-3"
            >
              {t('cta.submitApplication')}
            </Button>
          </Card>
        </MotionDiv>
      </main>
      <Footer />
    </div>
  );
}
