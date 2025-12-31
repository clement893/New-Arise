'use client';

import { LucideIcon } from 'lucide-react';

interface EvaluationCardProps {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  icon: LucideIcon;
  externalLink?: string;
  onContinue?: () => void;
}

export function EvaluationCard({
  title,
  description,
  status,
  icon: Icon,
  externalLink,
  onContinue,
}: EvaluationCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            In progress
          </span>
        );
      case 'locked':
        return null;
    }
  };

  const getActionButton = () => {
    if (status === 'locked') {
      return (
        <button
          disabled
          className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
        >
          Locked
        </button>
      );
    }

    if (status === 'completed') {
      return (
        <button
          onClick={onContinue}
          className="w-full px-4 py-2 border-2 border-arise-deep-teal text-arise-deep-teal rounded-lg font-medium hover:bg-arise-deep-teal hover:text-white transition-colors"
        >
          View Results
        </button>
      );
    }

    if (externalLink) {
      return (
        <a
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 bg-arise-deep-teal text-white rounded-lg font-medium hover:bg-arise-deep-teal/90 transition-colors text-center"
        >
          Continue
        </a>
      );
    }

    return (
      <button
        onClick={onContinue}
        className="w-full px-4 py-2 bg-arise-deep-teal text-white rounded-lg font-medium hover:bg-arise-deep-teal/90 transition-colors"
      >
        Continue
      </button>
    );
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-md ${status === 'locked' ? 'opacity-60' : ''}`}>
      {/* Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="text-arise-deep-teal" size={24} />
        </div>
        {externalLink && status !== 'locked' && (
          <span className="inline-block px-3 py-1 border border-arise-deep-teal text-arise-deep-teal text-xs rounded-full font-medium">
            External link
          </span>
        )}
      </div>

      {/* Title and Description */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {/* Status Badge */}
      {getStatusBadge()}

      {/* Action Button */}
      <div className="mt-4">{getActionButton()}</div>
    </div>
  );
}
