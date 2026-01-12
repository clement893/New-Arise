'use client';

import { useTranslations } from 'next-intl';

export function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');

  const testimonials = [
    {
      quote: t('testimonial1.quote'),
      author: t('testimonial1.author'),
      role: t('testimonial1.role')
    },
    {
      quote: t('testimonial2.quote'),
      author: t('testimonial2.author'),
      role: t('testimonial2.role')
    },
    {
      quote: t('testimonial3.quote'),
      author: t('testimonial3.author'),
      role: t('testimonial3.role')
    }
  ];

  return (
    <section className="py-20 bg-arise-light-beige">
      <div className="container mx-auto px-[11px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-arise-deep-teal mb-12 text-center">
            {t('title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-800 rounded-lg p-6 text-white shadow-lg"
              >
                <div className="mb-4">
                  <svg 
                    className="w-10 h-10 text-arise-gold" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-lg mb-6 leading-relaxed">
                  {testimonial.quote}
                </p>
                <div className="border-t border-white/20 pt-4">
                  <p className="font-semibold text-arise-gold">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-white/70">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
