'use client';

/**
 * Wellness Radar Chart Component
 * Displays the 6 wellness pillars in a radar/spider chart
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
} from 'recharts';

interface WellnessRadarChartProps {
  scores: Record<string, number>;
  labels?: Record<string, string>;
  className?: string;
}

const WellnessRadarChart: React.FC<WellnessRadarChartProps> = ({ 
  scores, 
  labels,
  className = '' 
}) => {
  // Pillar order for the radar (clockwise from top)
  const pillarOrder = [
    'sleep',
    'nutrition',
    'movement',
    'avoidance_of_risky_substances',
    'stress_management',
    'social_connection',
  ];

  // Default labels if not provided
  const defaultLabels: Record<string, string> = {
    'sleep': 'Sleep',
    'nutrition': 'Nutrition',
    'movement': 'Movement',
    'avoidance_of_risky_substances': 'Avoidance of toxic substances',
    'stress_management': 'Stress Management',
    'social_connection': 'Social Connections',
  };

  const displayLabels = labels || defaultLabels;

  // Custom tick component to handle multi-line labels
  const CustomTick = ({ payload, x, y, textAnchor, isMobile = false }: any) => {
    const text = payload.value;
    const words = text.split(' ');
    
    // Split into multiple lines if needed
    const lines: string[] = [];
    let currentLine = '';
    const maxLength = isMobile ? 8 : 12;
    
    words.forEach((word: string) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxLength && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    return (
      <text 
        x={x} 
        y={y} 
        textAnchor={textAnchor} 
        fill="#4b5563"
        fontSize={isMobile ? 12 : 14}
        fontWeight={500}
      >
        {lines.map((line, index) => (
          <tspan 
            key={index} 
            x={x} 
            dy={index === 0 ? 0 : (isMobile ? 10 : 12)}
          >
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  // Transform scores into recharts format
  const data = pillarOrder.map(pillarId => ({
    pillar: displayLabels[pillarId] || pillarId,
    score: scores[pillarId] || 0,
    fullMark: 25,
  }));

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop version - responsive heights for different screen sizes */}
      <ResponsiveContainer width="100%" height={350} className="hidden lg:block">
        <RadarChart 
          data={data}
          margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
        >
          <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="pillar"
            tick={<CustomTick isMobile={false} />}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 25]}
            tick={{ fill: '#6b7280', fontSize: 9 }}
            tickCount={6}
          />
          <Radar
            name="Your Scores"
            dataKey="score"
            stroke="#0F4C56"
            fill="#0F4C56"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value} / 25`, 'Score']}
            labelStyle={{ 
              fontWeight: 600, 
              marginBottom: '0.25rem',
              color: '#000000'
            }}
            itemStyle={{
              color: '#000000'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Medium screens (tablets) */}
      <ResponsiveContainer width="100%" height={320} className="hidden md:block lg:hidden">
        <RadarChart 
          data={data}
          margin={{ top: 18, right: 50, bottom: 18, left: 50 }}
        >
          <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="pillar"
            tick={<CustomTick isMobile={false} />}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 25]}
            tick={{ fill: '#6b7280', fontSize: 9 }}
            tickCount={6}
          />
          <Radar
            name="Your Scores"
            dataKey="score"
            stroke="#0F4C56"
            fill="#0F4C56"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value} / 25`, 'Score']}
            labelStyle={{ 
              fontWeight: 600, 
              marginBottom: '0.25rem',
              color: '#000000'
            }}
            itemStyle={{
              color: '#000000'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Mobile version - smaller and more compact */}
      <ResponsiveContainer width="100%" height={280} className="block md:hidden">
        <RadarChart 
          data={data}
          margin={{ top: 15, right: 25, bottom: 15, left: 25 }}
        >
          <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="pillar"
            tick={<CustomTick isMobile={true} />}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 25]}
            tick={{ fill: '#6b7280', fontSize: 8 }}
            tickCount={6}
          />
          <Radar
            name="Your Scores"
            dataKey="score"
            stroke="#0F4C56"
            fill="#0F4C56"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value} / 25`, 'Score']}
            labelStyle={{ 
              fontWeight: 600, 
              fontSize: '0.75rem',
              marginBottom: '0.125rem',
              color: '#000000'
            }}
            itemStyle={{
              color: '#000000',
              fontSize: '0.75rem'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WellnessRadarChart;
