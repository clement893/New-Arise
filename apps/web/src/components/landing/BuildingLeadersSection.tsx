'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function BuildingLeadersSection() {
  const t = useTranslations('landing.buildingLeaders');

  const images = [
    { src: '/images/arise-leader-1.jpg', alt: 'Professional business team collaboration' },
    { src: '/images/arise-leader-2.jpg', alt: 'Diverse leadership team' },
    { src: '/images/arise-leader-3.jpg', alt: 'Business professionals teamwork' },
    { src: '/images/arise-leader-4.jpg', alt: 'Executive coaching session', className: 'col-span-2 md:col-span-1' },
    { src: '/images/arise-leader-5.jpg', alt: 'Corporate leadership conference' },
    { src: '/images/arise-leader-6.jpg', alt: 'Professional business meeting' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-[11px]">
        <div className="mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-arise-deep-teal mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl whitespace-pre-line">
              {t('description')}
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-start">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`relative rounded-lg overflow-hidden shadow-md ${image.className || ''}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={450}
                  className="w-full h-auto block object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
