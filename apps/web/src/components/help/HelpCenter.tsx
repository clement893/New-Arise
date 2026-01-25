/**
 * Help Center Component
 * 
 * Main hub for help and support resources.
 * 
 * @component
 */

'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { HelpCircle, MessageSquare, Search } from 'lucide-react';

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

export interface HelpCenterProps {
  categories?: HelpCategory[];
  className?: string;
}

/**
 * Help Center Component
 * 
 * Displays help categories and quick links.
 */
export default function HelpCenter({
  categories,
  className,
}: HelpCenterProps) {
  const t = useTranslations('help');
  const [searchQuery, setSearchQuery] = useState('');

  // Build categories from translations
  const defaultCategories: HelpCategory[] = useMemo(() => [
    {
      id: 'faq',
      title: t('categories.faq.title'),
      description: t('categories.faq.description'),
      icon: <HelpCircle className="w-6 h-6" />,
      link: '/help/faq',
      color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'contact',
      title: t('categories.contact.title'),
      description: t('categories.contact.description'),
      icon: <MessageSquare className="w-6 h-6" />,
      link: '/contact',
      color: 'bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800',
    },
  ], [t]);

  const displayCategories = categories || defaultCategories;

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return displayCategories;
    }
    
    const query = searchQuery.toLowerCase();
    return displayCategories.filter((category) => {
      return (
        category.title.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.id.toLowerCase().includes(query)
      );
    });
  }, [displayCategories, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filteredCategories, no need for additional action
  };

  return (
    <div className={className}>
      {/* Search Bar */}
      <Card className="mb-8">
        <form onSubmit={handleSearch} className="flex md:flex-row flex-col items-center gap-4">
          <Search className="w-5 h-5 text-gray-500 md:display-block display-none" />
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
          />
          <Button 
            type="submit"
            variant="primary" 
            className="bg-arise-deep-teal hover:bg-arise-deep-teal/90 text-white"
          >
            {t('search.button')}
          </Button>
        </form>
      </Card>

      {/* Help Categories */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={category.link}>
              <Card
                hover
                className={`h-full ${category.color} border-2 transition-all`}
              >
                <div className="flex flex-col items-center text-center p-0 md:p-6">
                  <div className="mb-4 text-arise-deep-teal">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            {t('noResults', { query: searchQuery })}
          </p>
        </Card>
      )}

      {/* Quick Links */}
      <Card title={t('quickLinks.title')} className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/help/faq">
            <div className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900">{t('quickLinks.faq.title')}</h4>
              <p className="text-sm text-gray-600 mt-1">{t('quickLinks.faq.description')}</p>
            </div>
          </Link>
          <Link href="/contact">
            <div className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900">{t('quickLinks.contact.title')}</h4>
              <p className="text-sm text-gray-600 mt-1">{t('quickLinks.contact.description')}</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}


