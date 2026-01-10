'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Users, Linkedin, Mail, Award, GraduationCap, Briefcase } from 'lucide-react';
import Image from 'next/image';

export default function TeamPage() {
  const t = useTranslations('team');

// Team members data - to be replaced with real data
const teamMembers = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    role: 'CEO & Co-Founder',
    bio: 'Leadership development expert with 20+ years of experience in organizational psychology.',
    expertise: 'Organizational Psychology, Leadership Development',
    education: 'Ph.D. in Psychology, Harvard University',
    image: '/images/team/placeholder.jpg',
    linkedin: 'https://linkedin.com',
    email: 'sarah@arise.com',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'CTO & Co-Founder',
    bio: 'Technology visionary passionate about using data science to transform leadership assessment.',
    expertise: 'Data Science, Platform Architecture',
    education: 'M.S. in Computer Science, MIT',
    image: '/images/team/placeholder.jpg',
    linkedin: 'https://linkedin.com',
    email: 'michael@arise.com',
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    role: 'Head of Assessment',
    bio: 'Psychometrician specializing in personality and behavioral assessments.',
    expertise: 'Psychometrics, Assessment Design',
    education: 'Ph.D. in Measurement, Stanford University',
    image: '/images/team/placeholder.jpg',
    linkedin: 'https://linkedin.com',
    email: 'emily@arise.com',
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Head of Coaching',
    bio: 'Executive coach with extensive experience helping leaders unlock their potential.',
    expertise: 'Executive Coaching, Leadership Development',
    education: 'M.A. in Organizational Development, Columbia University',
    image: '/images/team/placeholder.jpg',
    linkedin: 'https://linkedin.com',
    email: 'david@arise.com',
  },
];

const advisoryBoard = [
  {
    id: 1,
    name: 'Prof. James Wilson',
    role: 'Advisory Board Member',
    bio: 'Renowned leadership researcher and author.',
    expertise: 'Leadership Research, Academic',
    image: '/images/team/placeholder.jpg',
  },
  {
    id: 2,
    name: 'Dr. Lisa Anderson',
    role: 'Advisory Board Member',
    bio: 'Expert in organizational behavior and team dynamics.',
    expertise: 'Organizational Behavior, Research',
    image: '/images/team/placeholder.jpg',
  },
];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-12 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="text-arise-deep-teal" size={40} />
              <h1 className="text-5xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </MotionDiv>

        {/* Leadership Team */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('leadership.title')}</h2>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <MotionDiv key={member.id} variant="slideUp" delay={index * 100}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 flex items-center justify-center overflow-hidden">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={128}
                            height={128}
                            className="object-cover"
                          />
                        ) : (
                          <Users className="text-arise-deep-teal/40" size={64} />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-lg text-arise-deep-teal font-semibold mb-3">{member.role}</p>
                      <p className="text-gray-700 mb-4">{member.bio}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <Briefcase className="text-arise-deep-teal flex-shrink-0 mt-1" size={16} />
                          <p className="text-sm text-gray-600">{member.expertise}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <GraduationCap className="text-arise-deep-teal flex-shrink-0 mt-1" size={16} />
                          <p className="text-sm text-gray-600">{member.education}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors"
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <Linkedin size={20} />
                          </a>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors"
                            aria-label={`Email ${member.name}`}
                          >
                            <Mail size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Advisory Board */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Award className="text-arise-gold" size={32} />
                  <h2 className="text-3xl font-bold text-gray-900">{t('advisory.title')}</h2>
                </div>
                <p className="text-gray-600">
                  {t('advisory.subtitle')}
                </p>
              </div>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {advisoryBoard.map((member, index) => (
              <MotionDiv key={member.id} variant="slideUp" delay={index * 100}>
                <Card className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-arise-gold/20 to-arise-deep-teal/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <Users className="text-arise-gold/40" size={48} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-arise-gold font-semibold mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600 mb-2">{member.expertise}</p>
                  <p className="text-sm text-gray-700">{member.bio}</p>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
