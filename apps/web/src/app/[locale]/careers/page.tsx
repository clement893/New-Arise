'use client';

import { useState } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import MotionDiv from '@/components/motion/MotionDiv';
import { Briefcase, MapPin, Clock, DollarSign, Users, Heart, Zap, Award, ArrowRight, Plus } from 'lucide-react';

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

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Salary',
    description: 'We offer competitive compensation packages with equity options.',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance for you and your family.',
  },
  {
    icon: Zap,
    title: 'Flexible Work',
    description: 'Remote-first culture with flexible hours and unlimited PTO.',
  },
  {
    icon: Users,
    title: 'Team Culture',
    description: 'Collaborative environment with regular team events and retreats.',
  },
  {
    icon: Award,
    title: 'Professional Growth',
    description: 'Learning budget, conference attendance, and career development support.',
  },
  {
    icon: Clock,
    title: 'Work-Life Balance',
    description: 'We believe in sustainable work practices and respect your personal time.',
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-12 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Briefcase className="text-arise-deep-teal" size={40} />
              <h1 className="text-5xl font-bold text-gray-900">
                Join Our Team
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help us empower authentic leaders around the world. We're building the future of leadership development.
            </p>
          </div>
        </MotionDiv>

        {/* Why Work With Us */}
        <div className="mb-16">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-arise-deep-teal/5 to-white">
            <MotionDiv variant="fade" duration="normal">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Work With Us</h2>
            </MotionDiv>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <MotionDiv key={index} variant="slideUp" delay={index * 50}>
                    <Card className="p-6 h-full">
                      <div className="w-12 h-12 bg-arise-deep-teal/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="text-arise-deep-teal" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
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
                        Apply Now
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Open Positions</h3>
              <p className="text-gray-600 mb-6">
                We don't have any open positions at the moment, but we're always interested in hearing from talented individuals.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowApplicationForm(true)}
                className="!bg-arise-deep-teal hover:!bg-arise-deep-teal/90 !text-white"
              >
                Submit General Application
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
                  <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
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
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
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
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Applied For *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
                    >
                      <option value="">Select a position</option>
                      {openPositions.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                      <option value="general">General Application</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Plus className="text-gray-400 mx-auto mb-2" size={24} />
                      <p className="text-sm text-gray-600 mb-2">
                        Drop your file here or click to browse
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
                        Choose File
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter
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
                      Submit Application
                      <ArrowRight size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Culture</h2>
            </MotionDiv>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mission-Driven</h3>
                <p className="text-gray-700">
                  Every team member is passionate about our mission to empower authentic leaders. We believe in the work we do and the impact we create.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Collaborative</h3>
                <p className="text-gray-700">
                  We work together as a team, sharing knowledge and supporting each other's growth. Collaboration is at the heart of everything we do.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Innovative</h3>
                <p className="text-gray-700">
                  We encourage experimentation and creative thinking. New ideas are welcomed and supported, whether they come from interns or executives.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Inclusive</h3>
                <p className="text-gray-700">
                  We celebrate diversity and create an inclusive environment where everyone can thrive and bring their authentic selves to work.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <MotionDiv variant="fade" duration="normal">
          <Card className="p-8 md:p-12 bg-gradient-to-r from-arise-deep-teal to-arise-deep-teal/90 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See a Role That Fits?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're always interested in connecting with talented individuals. Send us your resume and let us know how you'd like to contribute.
            </p>
            <Button
              variant="secondary"
              onClick={() => setShowApplicationForm(true)}
              className="!bg-arise-gold hover:!bg-arise-gold/90 !text-arise-deep-teal font-semibold px-8 py-3"
            >
              Submit General Application
            </Button>
          </Card>
        </MotionDiv>
      </main>
      <Footer />
    </div>
  );
}
