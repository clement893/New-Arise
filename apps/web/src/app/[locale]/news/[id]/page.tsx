'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import { SafeHTML } from '@/components/ui/SafeHTML';
import MotionDiv from '@/components/motion/MotionDiv';
import { Calendar, User, ArrowLeft, TrendingUp, BookOpen, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function NewsArticlePage() {
  const params = useParams();
  const articleId = params?.id as string;
  const t = useTranslations('news');

  // Map article IDs to translation keys and styling
  const articleMap: Record<string, { key: string; icon: typeof TrendingUp; gradient: string }> = {
    '1': { key: 'articles.article1', icon: TrendingUp, gradient: 'from-arise-deep-teal via-teal-600 to-arise-gold' },
    '2': { key: 'articles.article2', icon: BookOpen, gradient: 'from-blue-500 via-indigo-600 to-purple-600' },
    '3': { key: 'articles.article3', icon: Users, gradient: 'from-orange-500 via-red-500 to-pink-500' },
  };

  const articleConfig = articleMap[articleId];
  
  if (!articleConfig) {
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

  const IconComponent = articleConfig.icon;
  const article = {
    title: t(`${articleConfig.key}.title`),
    excerpt: t(`${articleConfig.key}.excerpt`),
    author: t(`${articleConfig.key}.author`),
    date: t(`${articleConfig.key}.date`),
    category: t(`${articleConfig.key}.category`),
    content: t(`${articleConfig.key}.content`),
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
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
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
            <div className={`relative aspect-video bg-gradient-to-br ${articleConfig.gradient} rounded-lg mb-8 overflow-hidden shadow-lg`}>
              <div className="absolute inset-0 bg-black/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <IconComponent className="text-white/90" size={80} strokeWidth={1.5} />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Post Excerpt */}
            {article.excerpt && (
              <div className="text-xl text-gray-700 mb-6 font-medium border-l-4 border-arise-deep-teal pl-4">
                {article.excerpt}
              </div>
            )}

            {/* Post Content */}
            <div className="prose prose-lg max-w-none mb-8 
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-200
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-arise-deep-teal
              prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:my-6 prose-ul:space-y-3
              prose-ol:my-6 prose-ol:space-y-3
              prose-li:text-gray-700 prose-li:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-arise-deep-teal prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:bg-gray-50 prose-blockquote:italic
              prose-a:text-arise-deep-teal prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
              prose-code:text-arise-deep-teal prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-6 prose-pre:my-8
              prose-hr:my-10 prose-hr:border-gray-200">
              <SafeHTML html={article.content} />
            </div>
          </Card>
        </MotionDiv>
      </main>
      <Footer />
    </div>
  );
}
