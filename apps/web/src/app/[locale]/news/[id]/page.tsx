'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import { SafeHTML } from '@/components/ui/SafeHTML';
import MotionDiv from '@/components/motion/MotionDiv';
import { Calendar, User, ArrowLeft, Newspaper } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function NewsArticlePage() {
  const params = useParams();
  const articleId = params?.id as string;
  const t = useTranslations('news');

  // Map article IDs to translation keys
  const articleMap: Record<string, string> = {
    '1': 'articles.article1',
    '2': 'articles.article2',
    '3': 'articles.article3',
  };

  const articleKey = articleMap[articleId];
  
  if (!articleKey) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Article Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The article you're looking for doesn't exist.
            </p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-arise-deep-teal hover:text-arise-gold font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const article = {
    title: t(`${articleKey}.title`),
    excerpt: t(`${articleKey}.excerpt`),
    author: t(`${articleKey}.author`),
    date: t(`${articleKey}.date`),
    category: t(`${articleKey}.category`),
    content: t(`${articleKey}.content`),
  };

  // Parse date for proper formatting
  const dateObj = new Date(article.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Link */}
        <MotionDiv variant="fade" duration="normal">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-arise-deep-teal hover:text-arise-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('readMore') === 'Read More' ? 'Back to News' : 'Retour aux actualités'}</span>
          </Link>
        </MotionDiv>

        {/* Article Card */}
        <MotionDiv variant="slideUp" delay={100}>
          <Card className="overflow-hidden">
            {/* Article Header */}
            <header className="mb-6">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-arise-deep-teal/10 text-arise-deep-teal text-sm font-medium rounded-full">
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>

              {/* Post Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {article.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                )}
                {article.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={article.date}>
                      {formattedDate}
                    </time>
                  </div>
                )}
              </div>
            </header>

            {/* Featured Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 rounded-lg mb-6 flex items-center justify-center">
              <Newspaper className="text-arise-deep-teal/40" size={64} />
            </div>

            {/* Post Excerpt */}
            {article.excerpt && (
              <div className="text-xl text-gray-700 mb-6 font-medium border-l-4 border-arise-deep-teal pl-4">
                {article.excerpt}
              </div>
            )}

            {/* Post Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <SafeHTML html={article.content} />
            </div>
          </Card>
        </MotionDiv>
      </main>
      <Footer />
    </div>
  );
}
