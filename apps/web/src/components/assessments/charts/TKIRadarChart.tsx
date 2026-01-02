'use client';

/**
 * TKI Radar Chart Component
 * Displays the 5 conflict modes in a radar/spider chart
 */

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface TKIRadarChartProps {
  scores: Record<string, number>;
  className?: string;
}

const TKIRadarChart: React.FC<TKIRadarChartProps> = ({ scores, className = '' }) => {
  // Transform scores into recharts format
  const data = [
    {
      mode: 'Competing',
      score: scores.competing || 0,
      fullMark: 12,
    },
    {
      mode: 'Collaborating',
      score: scores.collaborating || 0,
      fullMark: 12,
    },
    {
      mode: 'Compromising',
      score: scores.compromising || 0,
      fullMark: 12,
    },
    {
      mode: 'Avoiding',
      score: scores.avoiding || 0,
      fullMark: 12,
    },
    {
      mode: 'Accommodating',
      score: scores.accommodating || 0,
      fullMark: 12,
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="mode"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 12]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Radar
            name="Your Scores"
            dataKey="score"
            stroke="#14b8a6"
            fill="#14b8a6"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
            formatter={(value: number) => [`${value} / 12`, 'Score']}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '1rem',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TKIRadarChart;
