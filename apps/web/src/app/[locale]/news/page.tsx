'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Calendar, User, ArrowRight, Newspaper } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function NewsPage() {
  const t = useTranslations('news');

  const articles = [
    {
      id: 1,
      title: t('articles.article1.title'),
      excerpt: t('articles.article1.excerpt'),
      author: t('articles.article1.author'),
      date: t('articles.article1.date'),
      category: t('articles.article1.category'),
    },
    {
      id: 2,
      title: t('articles.article2.title'),
      excerpt: t('articles.article2.excerpt'),
      author: t('articles.article2.author'),
      date: t('articles.article2.date'),
      category: t('articles.article2.category'),
    },
    {
      id: 3,
      title: t('articles.article3.title'),
      excerpt: t('articles.article3.excerpt'),
      author: t('articles.article3.author'),
      date: t('articles.article3.date'),
      category: t('articles.article3.category'),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-12 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Newspaper className="text-arise-deep-teal" size={40} />
              <h1 className="text-5xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </MotionDiv>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, index) => (
            <MotionDiv key={article.id} variant="slideUp" delay={index * 100}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                {/* Article Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 rounded-t-lg mb-4 flex items-center justify-center">
                  <Newspaper className="text-arise-deep-teal/40" size={48} />
                </div>

                {/* Article Content */}
                <div className="flex-1 flex flex-col p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-arise-deep-teal/10 text-arise-deep-teal text-sm font-medium rounded-full">
                      {article.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/news/${article.id}`}
                    className="inline-flex items-center gap-2 text-arise-deep-teal hover:text-arise-gold font-semibold transition-colors mt-auto"
                  >
                    {t('readMore')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
