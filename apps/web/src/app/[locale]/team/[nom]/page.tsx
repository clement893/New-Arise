'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import MotionDiv from '@/components/motion/MotionDiv';
import { ArrowLeft, Linkedin, Mail, GraduationCap, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { Link, useParams } from '@/i18n/routing';
import { useState } from 'react';

export default function TeamMemberBioPage() {
  const t = useTranslations('team');
  const params = useParams();
  const nom = params.nom as string;
  const [isFullStoryOpen, setIsFullStoryOpen] = useState(false);

  // Team members data
  const teamMembers: Record<string, {
    name: string;
    role: string;
    bio: string;
    fullStory: string;
    expertise: string;
    education: string;
    wellbeing: string;
    image: string;
    linkedin: string;
    email: string;
  }> = {
    'gabriela-loureiro': {
      name: 'Gabriela Loureiro',
      role: t('members.gabriela.role'),
      bio: t('members.gabriela.bio'),
      fullStory: t('members.gabriela.fullStory'),
      expertise: t('members.gabriela.expertise'),
      education: t('members.gabriela.education'),
      wellbeing: t('members.gabriela.wellbeing'),
      image: '/images/team/gabriela.webp',
      linkedin: t('members.gabriela.linkedin'),
      email: 'info@arisehumancapital.com',
    },
    'tamara-lovi': {
      name: 'Tamara Lovi, MBA',
      role: t('members.tamara.role'),
      bio: t('members.tamara.bio'),
      fullStory: t('members.tamara.fullStory'),
      expertise: t('members.tamara.expertise'),
      education: t('members.tamara.education'),
      wellbeing: t('members.tamara.wellbeing'),
      image: '/images/team/tamara.webp',
      linkedin: t('members.tamara.linkedin'),
      email: 'info@arisehumancapital.com',
    },
  };

  const member = teamMembers[nom];

  // If member not found, show 404 or redirect
  if (!member) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Member not found</h1>
            <Link href="/team">
              <Button variant="secondary">
                <ArrowLeft className="mr-2" size={16} />
                Back to Team
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        {/* Back Button */}
        <MotionDiv variant="fade" duration="normal">
          <Link href="/team">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2" size={16} />
              {t('back') || 'Back'}
            </Button>
          </Link>
        </MotionDiv>

        {/* Member Bio Content */}
        <MotionDiv variant="fade" duration="normal">
          <div className="flex flex-col items-center mb-8">
            <div className="w-64 h-64 rounded-lg bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 flex items-center justify-center overflow-hidden border-white shadow-lg mb-6">
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  width={256}
                  height={256}
                  className="object-cover object-top h-full"
                />
              ) : null}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">{member.name}</h1>
            <p className="text-2xl text-arise-deep-teal font-semibold mb-6 text-center">{member.role}</p>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">{member.bio}</p>
          </div>

          {/* View Full Story Button */}
          <div className="mb-8">
            <Button
              onClick={() => setIsFullStoryOpen(true)}
              variant="outline"
              className="w-full md:w-auto"
            >
              {t('viewFullStory') || 'View Full Story'}
            </Button>
          </div>

          {/* Education Section */}
          <div className="mb-8 p-6 bg-arise-deep-teal/5 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <GraduationCap className="text-arise-deep-teal flex-shrink-0 mt-1" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">{t('education') || 'EDUCATION'}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{member.education}</p>
          </div>

          {/* My Wellbeing Section */}
          {member.wellbeing && (
            <div className="mb-8 p-6 bg-arise-gold/5 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('myWellbeing') || 'MY WELLBEING'}</h2>
              <p className="text-gray-700 leading-relaxed italic">{member.wellbeing}</p>
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors"
                aria-label={`${member.name} LinkedIn`}
              >
                <Linkedin size={24} />
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors"
                aria-label={`Email ${member.name}`}
              >
                <Mail size={24} />
              </a>
            )}
          </div>
        </MotionDiv>

        {/* Full Story Modal */}
        <Modal
          isOpen={isFullStoryOpen}
          onClose={() => setIsFullStoryOpen(false)}
          title={member.name}
          size="lg"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-arise-deep-teal font-semibold text-lg mb-6">{member.role}</p>
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {member.fullStory}
            </div>
          </div>
        </Modal>
      </main>
      <Footer />
    </div>
  );
}
