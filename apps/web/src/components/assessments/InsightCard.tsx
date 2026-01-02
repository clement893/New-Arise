'use client';

/**
 * Insight Card Component
 * Displays an interpretation/insight for an assessment dimension
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';

interface InsightCardProps {
  title: string;
  level: 'low' | 'moderate' | 'high' | 'very_high';
  score?: number;
  maxScore?: number;
  description: string;
  color?: string;
  className?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  level,
  score,
  maxScore,
  description,
  color,
  className = '',
}) => {
  // Level configurations
  const levelConfig = {
    low: {
      label: 'Low',
      icon: TrendingDown,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-500',
      borderColor: 'border-gray-300',
    },
    moderate: {
      label: 'Moderate',
      icon: Minus,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-300',
    },
    high: {
      label: 'High',
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      borderColor: 'border-green-300',
    },
    very_high: {
      label: 'Very High',
      icon: AlertCircle,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-800',
      iconColor: 'text-teal-600',
      borderColor: 'border-teal-300',
    },
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <Card className={`${className} border-l-4 ${config.borderColor}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}
              >
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
                {config.label}
              </span>
              {score !== undefined && maxScore !== undefined && (
                <span className="text-sm text-gray-600">
                  {score} / {maxScore}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </Card>
  );
};

export default InsightCard;
