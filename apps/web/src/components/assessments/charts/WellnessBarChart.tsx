'use client';

/**
 * Wellness Bar Chart Component
 * Displays the 6 wellness pillars in a bar chart
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
  Cell,
} from 'recharts';

interface WellnessBarChartProps {
  scores: Record<string, number>;
  className?: string;
}

const WellnessBarChart: React.FC<WellnessBarChartProps> = ({ scores, className = '' }) => {
  // Pillar colors (teal gradient)
  const pillarColors: Record<string, string> = {
    sleep: '#0d9488',
    nutrition: '#14b8a6',
    hydration: '#2dd4bf',
    movement: '#5eead4',
    stress_management: '#99f6e4',
    social_connection: '#ccfbf1',
  };

  // Pillar display names
  const pillarNames: Record<string, string> = {
    sleep: 'Sleep',
    nutrition: 'Nutrition',
    hydration: 'Hydration',
    movement: 'Movement',
    stress_management: 'Stress Management',
    social_connection: 'Social Connection',
  };

  // Transform scores into recharts format
  const data = Object.entries(scores).map(([pillar, score]) => ({
    pillar: pillarNames[pillar] || pillar,
    score: score,
    maxScore: 25,
    color: pillarColors[pillar] || '#14b8a6',
  }));

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="pillar"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#6b7280', fontSize: 16 }}
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
          <Bar dataKey="score" name="Your Score" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WellnessBarChart;
