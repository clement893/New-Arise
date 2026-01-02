'use client';

/**
 * 360° Feedback Bar Chart Component
 * Displays the 6 leadership capabilities in a bar chart
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Feedback360BarChartProps {
  scores: Record<string, number>;
  comparisonScores?: Record<string, number>;  // For self vs others comparison
  className?: string;
}

const Feedback360BarChart: React.FC<Feedback360BarChartProps> = ({
  scores,
  comparisonScores,
  className = '',
}) => {
  // Capability colors (gold gradient)
  const capabilityColors: Record<string, string> = {
    communication: '#f59e0b',
    team_culture: '#fbbf24',
    accountability: '#fcd34d',
    talent_development: '#fde68a',
    execution: '#fef3c7',
    strategic_thinking: '#fffbeb',
  };

  // Capability display names
  const capabilityNames: Record<string, string> = {
    communication: 'Communication',
    team_culture: 'Team Culture',
    accountability: 'Accountability',
    talent_development: 'Talent Development',
    execution: 'Execution',
    strategic_thinking: 'Strategic Thinking',
  };

  // Transform scores into recharts format
  const data = Object.entries(scores).map(([capability, score]) => ({
    capability: capabilityNames[capability] || capability,
    selfScore: score,
    othersScore: comparisonScores?.[capability] || null,
    maxScore: 25,
    color: capabilityColors[capability] || '#f59e0b',
  }));

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="capability"
            angle={-45}
            textAnchor="end"
            height={120}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 25]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Score',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
            formatter={(value: number) => [`${value} / 25`, 'Score']}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '1rem',
            }}
          />
          <Bar dataKey="selfScore" name="Self Assessment" fill="#14b8a6" radius={[8, 8, 0, 0]} />
          {comparisonScores && (
            <Bar
              dataKey="othersScore"
              name="Others' Assessment"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Feedback360BarChart;
