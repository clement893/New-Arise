'use client';

import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import MotionDiv from '@/components/motion/MotionDiv';
import { Target, Eye, Heart, Award, ArrowRight, Users, Lightbulb, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-12 pb-6 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Our Story
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering authentic leaders through holistic assessment and development
            </p>
          </div>
        </MotionDiv>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-arise-deep-teal" size={32} />
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  To empower leaders worldwide by providing comprehensive, science-based assessments and personalized development pathways that unlock their authentic leadership potential.
                </p>
                <p className="text-gray-700">
                  We believe that great leadership starts with self-awareness. Through our holistic approach combining personality insights, conflict management skills, 360° feedback, and wellness assessment, we help leaders understand themselves deeply and grow authentically.
                </p>
              </div>
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="text-arise-deep-teal/30" size={120} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vision Section */}
        <div className="mb-16">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-arise-deep-teal/5 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-arise-gold/20 to-arise-deep-teal/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye className="text-arise-gold/30" size={120} />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="text-arise-gold" size={32} />
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  A world where every leader reaches their full potential, creating positive impact in their organizations and communities.
                </p>
                <p className="text-gray-700">
                  We envision a future where leadership development is accessible, personalized, and grounded in scientific research. Where leaders are equipped not just with skills, but with deep self-awareness and authentic purpose.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="text-arise-deep-teal" size={32} />
                <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-arise-deep-teal" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Authenticity</h3>
              <p className="text-gray-600">
                We believe in genuine leadership that comes from understanding and embracing your true self.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-arise-gold" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600">
                We are committed to continuous learning and helping leaders grow throughout their journey.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-arise-deep-teal" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We leverage cutting-edge science and technology to deliver the best assessment and development tools.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-arise-gold" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest quality in everything we do, from assessments to customer support.
              </p>
            </Card>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <Card className="p-8 md:p-12">
            <MotionDiv variant="fade" duration="normal">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Journey</h2>
            </MotionDiv>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-deep-teal rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">2020 - Foundation</h3>
                  <p className="text-gray-700">
                    ARISE was founded with a vision to revolutionize leadership development through holistic assessment and personalized insights.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-gold rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">2021 - First Assessments</h3>
                  <p className="text-gray-700">
                    Launched our first comprehensive assessment suite, combining MBTI, TKI, 360° Feedback, and Wellness assessments.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-deep-teal rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">2022 - Platform Launch</h3>
                  <p className="text-gray-700">
                    Introduced our integrated platform, making leadership development accessible to individuals, coaches, and organizations worldwide.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-gold rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">2023 - Global Expansion</h3>
                  <p className="text-gray-700">
                    Expanded our services globally, supporting thousands of leaders across multiple countries and industries.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-deep-teal rounded-full flex items-center justify-center text-white font-bold">
                    5
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">2024 - Today</h3>
                  <p className="text-gray-700">
                    Continuing to innovate and expand, helping more leaders discover their authentic leadership style and reach their full potential.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <MotionDiv variant="fade" duration="normal">
          <Card className="p-8 md:p-12 bg-gradient-to-r from-arise-deep-teal to-arise-deep-teal/90 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Leadership Journey?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of leaders who have discovered their authentic leadership style through ARISE.
            </p>
            <Button
              as="a"
              href="/register"
              className="!bg-arise-gold hover:!bg-arise-gold/90 !text-arise-deep-teal font-semibold px-8 py-3 text-lg inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </Button>
          </Card>
        </MotionDiv>
      </main>
      <Footer />
    </div>
  );
}
