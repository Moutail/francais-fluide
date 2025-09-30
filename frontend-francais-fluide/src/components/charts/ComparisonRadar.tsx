'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ui';

interface ComparisonRadarProps {
  data: Array<{
    subject: string;
    user: number;
    average: number;
    top: number;
  }>;
  className?: string;
}

export default function ComparisonRadar({ data, className = '' }: ComparisonRadarProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'user' && `Vous: ${entry.value}%`}
              {entry.dataKey === 'average' && `Moyenne: ${entry.value}%`}
              {entry.dataKey === 'top' && `Meilleurs: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Comparaison des Compétences</h3>
        <p className="text-sm text-gray-600">
          Vos forces et faiblesses par rapport aux autres apprenants
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#374151' }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />

            <Radar
              name="Vous"
              dataKey="user"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Moyenne"
              dataKey="average"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="5 5"
            />
            <Radar
              name="Meilleurs"
              dataKey="top"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Vous</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full border border-green-500 bg-green-500"
            style={{ background: 'transparent' }}
          ></div>
          <span className="text-gray-600">Moyenne</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full border border-yellow-500 bg-yellow-500"
            style={{ background: 'transparent' }}
          ></div>
          <span className="text-gray-600">Meilleurs</span>
        </div>
      </div>

      {data.length === 0 && (
        <div className="flex h-80 items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="mb-2 text-4xl">📊</div>
            <p>Aucune donnée de comparaison disponible</p>
          </div>
        </div>
      )}
    </Card>
  );
}
