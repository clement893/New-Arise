'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function BuildingLeadersSection() {
  const t = useTranslations('landing.buildingLeaders');

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-[11px]">
        <div className="mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-arise-deep-teal mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl">
              {t('description')}
            </p>
          </div>

          {/* Image Grid */}
          {/* NOTE: Images should be replaced with images from ARISE bank of images 
              (https://drive.google.com/drive/folders/1yyPb1Pmz-YaNhI2oik59L3oSmQZc9X_p?usp=drive_link) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md bg-gray-50">
              <Image
                src="/images/arise-leader-1.jpg"
                alt="Professional business team collaboration"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md bg-gray-50">
              <Image
                src="/images/arise-leader-2.jpg"
                alt="Diverse leadership team"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md bg-gray-50">
              <Image
                src="/images/arise-leader-3.jpg"
                alt="Business professionals teamwork"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md col-span-2 md:col-span-1 bg-gray-50">
              <Image
                src="/images/arise-leader-4.jpg"
                alt="Executive coaching session"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md bg-gray-50">
              <Image
                src="/images/arise-leader-5.jpg"
                alt="Corporate leadership conference"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden shadow-md bg-gray-50">
              <Image
                src="/images/arise-leader-6.jpg"
                alt="Professional business meeting"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
