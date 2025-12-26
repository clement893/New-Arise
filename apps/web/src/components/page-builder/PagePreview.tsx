/**
 * Page Preview Component
 * 
 * Preview mode for page builder pages.
 * 
 * @component
 */

'use client';

import { Card } from '@/components/ui';
import type { PageSection } from './PageEditor';

export interface PagePreviewProps {
  sections: PageSection[];
  className?: string;
}

/**
 * Page Preview Component
 * 
 * Displays page sections in preview mode.
 */
export default function PagePreview({
  sections,
  className,
}: PagePreviewProps) {
  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="bg-primary-600 dark:bg-primary-700 text-white py-20 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">{section.title || 'Hero Section'}</h1>
            {section.content && (
              <p className="text-xl opacity-90">{section.content}</p>
            )}
          </div>
        );
      case 'content':
        return (
          <div className="py-12 px-4 max-w-4xl mx-auto">
            {section.title && (
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {section.title}
              </h2>
            )}
            {section.content && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            )}
          </div>
        );
      case 'features':
        return (
          <div className="py-12 px-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-6xl mx-auto">
              {section.title && (
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                  {section.title}
                </h2>
              )}
              {section.content && (
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                  {section.content}
                </p>
              )}
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              {section.title && (
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
                  {section.title}
                </h2>
              )}
              {section.content && (
                <div className="text-center text-gray-600 dark:text-gray-400">
                  {section.content}
                </div>
              )}
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className="bg-primary-600 dark:bg-primary-700 text-white py-16 px-4 text-center">
            {section.title && (
              <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
            )}
            {section.content && (
              <p className="text-xl opacity-90 mb-6">{section.content}</p>
            )}
          </div>
        );
      default:
        return (
          <div className="py-8 px-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            {section.title && (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {section.title}
              </h3>
            )}
            {section.content && (
              <p className="text-gray-600 dark:text-gray-400">{section.content}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {sections.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No sections to preview. Add sections in the editor.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-0">
          {sections.map((section) => (
            <div key={section.id}>
              {renderSection(section)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

