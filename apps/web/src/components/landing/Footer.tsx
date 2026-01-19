'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="bg-gray-900 text-white py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/arise-logo-white.png"
                alt="ARISE"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm">
              {t('description')}
            </p>
          </div>

          {/* About Us */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('aboutUs')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('ourStory')}
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('team')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('support')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('legal')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
                  {t('cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            {t('copyright', { year: t('year') })}
          </p>
          <div className="flex space-x-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-arise-gold transition-colors cursor-pointer">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
