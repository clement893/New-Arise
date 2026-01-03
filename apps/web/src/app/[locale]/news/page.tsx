'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Calendar, User, ArrowRight, TrendingUp, BookOpen, Users, Newspaper } from 'lucide-react';
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
      icon: TrendingUp,
      gradient: 'from-arise-deep-teal via-teal-600 to-arise-gold',
    },
    {
      id: 2,
      title: t('articles.article2.title'),
      excerpt: t('articles.article2.excerpt'),
      author: t('articles.article2.author'),
      date: t('articles.article2.date'),
      category: t('articles.article2.category'),
      icon: BookOpen,
      gradient: 'from-blue-500 via-indigo-600 to-purple-600',
    },
    {
      id: 3,
      title: t('articles.article3.title'),
      excerpt: t('articles.article3.excerpt'),
      author: t('articles.article3.author'),
      date: t('articles.article3.date'),
      category: t('articles.article3.category'),
      icon: Users,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
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
          {articles.map((article, index) => {
            const IconComponent = article.icon;
            return (
              <MotionDiv key={article.id} variant="slideUp" delay={index * 100}>
                <Link href={`/news/${article.id}`} className="block h-full">
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                    {/* Article Image Placeholder */}
                    <div className={`relative aspect-video bg-gradient-to-br ${article.gradient} overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <IconComponent className="text-white/90 group-hover:text-white transition-colors duration-300" size={64} strokeWidth={1.5} />
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors duration-300" />
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 flex flex-col p-6">
                      {/* Category Badge */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1.5 bg-arise-deep-teal/10 text-arise-deep-teal text-xs font-semibold rounded-full uppercase tracking-wide">
                          {article.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-arise-deep-teal transition-colors duration-300">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {article.excerpt}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{article.date}</span>
                        </div>
                      </div>

                      {/* Read More Link */}
                      <div className="inline-flex items-center gap-2 text-arise-deep-teal group-hover:text-arise-gold font-semibold transition-colors mt-auto">
                        {t('readMore')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </MotionDiv>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
