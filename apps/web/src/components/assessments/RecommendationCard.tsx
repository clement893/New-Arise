'use client';

/**
 * Recommendation Card Component
 * Displays a personalized recommendation with actions and resources
 */

import React from 'react';
import { CheckCircle, ExternalLink, Lightbulb } from 'lucide-react';
import Card from '@/components/ui/Card';

interface Resource {
  title: string;
  url: string;
}

interface RecommendationCardProps {
  title: string;
  description: string;
  actions?: string[];
  resources?: Resource[];
  priority?: 'low' | 'medium' | 'high';
  className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  actions = [],
  resources = [],
  priority = 'medium',
  className = '',
}) => {
  // Priority configurations
  const priorityConfig = {
    low: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      iconColor: 'text-blue-600',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    medium: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      iconColor: 'text-yellow-600',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    high: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      iconColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-800',
    },
  };

  const config = priorityConfig[priority];

  return (
    <Card className={`${className} border-l-4 ${config.borderColor} ${config.bgColor}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Lightbulb className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${config.badgeColor}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Action Steps:</h4>
            <ul className="space-y-2">
              {actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Resources:</h4>
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span>{resource.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecommendationCard;
