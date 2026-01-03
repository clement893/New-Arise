'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';

export function FourDimensionsSection() {
  const dimensions = [
    {
      number: '01',
      title: 'MBTI',
      subtitle: 'Personality Assessment',
      description: 'Understand your natural preferences and how you interact with the world around you through the Myers-Briggs Type Indicator.'
    },
    {
      number: '02',
      title: 'TKI',
      subtitle: 'Conflict Management',
      description: 'Discover your conflict-handling styles and learn how to navigate challenging situations with confidence and effectiveness.'
    },
    {
      number: '03',
      title: '360°',
      subtitle: 'Peer Leadership',
      description: 'Gain comprehensive feedback from colleagues, managers, and direct reports to understand your leadership impact from all angles.'
    },
    {
      number: '04',
      title: 'WELLNESS',
      subtitle: 'Well-being Assessment',
      description: 'Assess your physical and mental health, work-life balance, and overall wellness to ensure sustainable leadership performance.'
    }
  ];

  return (
    <section className="py-20 bg-arise-deep-teal">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-arise-gold text-sm uppercase tracking-widest mb-4">
            OUR METHODOLOGY
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Four dimensions,
          </h2>
          <h3 className="text-3xl md:text-4xl font-semibold text-white/90">
            one unified profile
          </h3>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {dimensions.map((dimension) => (
            <div 
              key={dimension.number}
              className="flex items-start p-6 border-2 border-arise-gold rounded-lg bg-arise-deep-teal/50 backdrop-blur-sm hover:bg-arise-deep-teal/70 transition-all duration-300"
            >
              <div className="flex-shrink-0 mr-6">
                <span className="text-5xl font-bold text-arise-gold">
                  {dimension.number}
                </span>
              </div>
              <div className="flex-grow text-left">
                <h4 className="text-2xl font-bold text-white mb-1">
                  {dimension.title}
                </h4>
                <p className="text-arise-gold text-sm font-medium mb-2">
                  {dimension.subtitle}
                </p>
                <p className="text-white/80 text-base">
                  {dimension.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-xl text-white/90">
            All four assessments integrate <span className="text-arise-gold font-semibold">seamlessly</span> to create your{' '}
            <span className="text-arise-gold font-semibold">comprehensive leadership profile</span>.
          </p>
          <p className="text-lg text-white/70 mt-4">
            Gain deep insights into your strengths, growth areas, and unique leadership style.
          </p>
          
          <div className="mt-8">
            <Button 
              asChild 
              size="lg"
              className="bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold px-8 py-6 text-lg"
            >
              <Link href="/register">Commencer maintenant</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
