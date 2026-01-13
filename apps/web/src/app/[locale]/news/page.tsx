'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
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
          <div className="mb-16 rounded-2xl overflow-hidden" style={{ backgroundColor: '#0F4C56' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 items-stretch">
              {/* Left Section - Text on Dark Teal Background (2/3) */}
              <div className="md:col-span-2 relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <div className="text-left">
                  <h1 className="mb-6">
                    <span className="block text-4xl md:text-5xl lg:text-6xl font-medium mb-2 text-white">
                      Actualités
                    </span>
                    <span className="block text-4xl md:text-5xl lg:text-6xl font-medium" style={{ color: '#D8B868' }}>
                      & Insights
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-white max-w-2xl leading-relaxed">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
              
              {/* Right Section - Photo (1/3) */}
              <div className="md:col-span-1 relative h-64 md:h-auto rounded-r-2xl overflow-hidden">
                <div className="absolute inset-0">
                  <Image 
                    src="/images/news-hero.jpg" 
                    alt="Actualités & Insights"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Fallback gradient if image fails to load */}
                  <div className="absolute inset-0 bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Newspaper className="text-white/30" size={120} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, index) => {
            const IconComponent = article.icon;
            return (
              <MotionDiv key={article.id} variant="slideUp" delay={index * 100}>
                <Link href={`/news/${article.id}`} className="block h-full">
                  <Card className="h-full flex flex-col overflow-hidden bg-white hover:shadow-xl transition-all duration-300 rounded-xl">
                    {/* Article Image Placeholder with Gradient */}
                    <div className={`relative aspect-video bg-gradient-to-br ${article.gradient} overflow-hidden rounded-t-xl`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconComponent className="text-white" size={64} strokeWidth={2} />
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 flex flex-col p-6">
                      {/* Category Badge */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                          {article.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-base text-gray-900 mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {article.excerpt}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center gap-4 text-sm text-gray-900 mb-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{article.date}</span>
                        </div>
                      </div>

                      {/* Read More Link */}
                      <div className="inline-flex items-center gap-2 text-gray-900 font-semibold mt-auto">
                        {t('readMore')}
                        <ArrowRight className="w-4 h-4" />
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
