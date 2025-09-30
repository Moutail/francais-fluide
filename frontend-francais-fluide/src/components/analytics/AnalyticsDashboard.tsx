'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsDashboardProps {
  data: Array<{
    date: string;
    words: number;
    accuracy: number;
    time: number;
    exercises: number;
  }>;
  className?: string;
}

export function AnalyticsDashboard({ data, className = '' }: AnalyticsDashboardProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex h-96 items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="mb-4 text-4xl">📊</div>
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-96 w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={value =>
              new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
            }
          />
          <YAxis />
          <Tooltip
            labelFormatter={value => new Date(value).toLocaleDateString('fr-FR')}
            formatter={(value, name) => [
              name === 'words'
                ? `${value} mots`
                : name === 'accuracy'
                  ? `${value}%`
                  : name === 'time'
                    ? `${value} min`
                    : name === 'exercises'
                      ? `${value} exercices`
                      : value,
              name === 'words'
                ? 'Mots'
                : name === 'accuracy'
                  ? 'Précision'
                  : name === 'time'
                    ? 'Temps'
                    : name === 'exercises'
                      ? 'Exercices'
                      : name,
            ]}
          />
          <Line type="monotone" dataKey="words" stroke="#3B82F6" strokeWidth={2} name="words" />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#10B981"
            strokeWidth={2}
            name="accuracy"
          />
          <Line
            type="monotone"
            dataKey="exercises"
            stroke="#F59E0B"
            strokeWidth={2}
            name="exercises"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
