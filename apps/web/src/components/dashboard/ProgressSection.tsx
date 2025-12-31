'use client';

interface ProgressItem {
  label: string;
  percentage: number;
  color: 'teal' | 'orange' | 'gray';
}

interface ProgressSectionProps {
  overallProgress: number;
  items: ProgressItem[];
}

export function ProgressSection({ overallProgress, items }: ProgressSectionProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'teal':
        return 'bg-arise-deep-teal';
      case 'orange':
        return 'bg-arise-gold';
      case 'gray':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-arise-deep-teal/90 rounded-lg p-8 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
          <div className="text-6xl font-bold mb-2">{overallProgress} %</div>
          <p className="text-white/80 mb-1">
            You are making good progress in your holistic leadership journey.
          </p>
          <p className="text-white font-semibold">Keep it up!</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm font-semibold">{item.percentage} %</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`${getColorClasses(item.color)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-2 bg-arise-gold text-arise-deep-teal rounded-lg font-semibold hover:bg-arise-gold/90 transition-colors">
          Continue Learning
        </button>
        <button className="px-6 py-2 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
          View Reports
        </button>
      </div>
    </div>
  );
}
