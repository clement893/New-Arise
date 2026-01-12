/**
 * Help Center Component
 * 
 * Main hub for help and support resources.
 * 
 * @component
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { HelpCircle, MessageSquare, BookOpen, Video, FileText, Search } from 'lucide-react';

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

const defaultCategories: HelpCategory[] = [
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Questions fréquemment posées et leurs réponses',
    icon: <HelpCircle className="w-6 h-6" />,
    link: '/help/faq',
    color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'guides',
    title: 'Guides Utilisateur',
    description: 'Guides pas à pas et tutoriels détaillés',
    icon: <BookOpen className="w-6 h-6" />,
    link: '/help/guides',
    color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
  },
  {
    id: 'videos',
    title: 'Tutoriels Vidéo',
    description: 'Regardez des tutoriels vidéo et des démonstrations',
    icon: <Video className="w-6 h-6" />,
    link: '/help/videos',
    color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'contact',
    title: 'Contacter le Support',
    description: 'Entrez en contact avec notre équipe de support',
    icon: <MessageSquare className="w-6 h-6" />,
    link: '/help/contact',
    color: 'bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800',
  },
  {
    id: 'tickets',
    title: 'Tickets de Support',
    description: 'Consultez et gérez vos tickets de support',
    icon: <FileText className="w-6 h-6" />,
    link: '/help/tickets',
    color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
  },
];

/**
 * Help Center Component
 * 
 * Displays help categories and quick links.
 */
export default function HelpCenter({
  categories = defaultCategories,
  className,
}: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    
    const query = searchQuery.toLowerCase();
    return categories.filter((category) => {
      return (
        category.title.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.id.toLowerCase().includes(query)
      );
    });
  }, [categories, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filteredCategories, no need for additional action
  };

  return (
    <div className={className}>
      {/* Search Bar */}
      <Card className="mb-8">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher de l'aide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-arise-deep-teal focus:border-transparent"
          />
          <Button 
            type="submit"
            variant="primary" 
            className="bg-arise-deep-teal hover:bg-arise-deep-teal/90 text-white"
          >
            Rechercher
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
                <div className="flex flex-col items-center text-center p-6">
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
            Aucun résultat trouvé pour "{searchQuery}". Essayez avec d'autres mots-clés.
          </p>
        </Card>
      )}

      {/* Quick Links */}
      <Card title="Liens Rapides" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/help/faq">
            <div className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900">Questions Courantes</h4>
              <p className="text-sm text-gray-600 mt-1">Trouvez des réponses aux questions courantes</p>
            </div>
          </Link>
          <Link href="/contact">
            <div className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900">Besoin d'Aide Supplémentaire ?</h4>
              <p className="text-sm text-gray-600 mt-1">Contactez notre équipe de support</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}


