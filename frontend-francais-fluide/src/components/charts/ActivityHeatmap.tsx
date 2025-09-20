'use client';

import React from 'react';
import { Card } from '@/components/ui';

interface ActivityHeatmapProps {
  data: Array<{
    date: string;
    value: number;
    level: 0 | 1 | 2 | 3 | 4;
  }>;
  className?: string;
}

export default function ActivityHeatmap({
  data,
  className = ''
}: ActivityHeatmapProps) {
  // Organiser les données par mois
  const organizeDataByMonth = () => {
    const months: { [key: string]: Array<{ date: string; value: number; level: 0 | 1 | 2 | 3 | 4 }> } = {};
    
    data.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(item);
    });
    
    return months;
  };

  const months = organizeDataByMonth();
  const monthNames = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  const getDayOfWeek = (date: string) => {
    const day = new Date(date).getDay();
    return day === 0 ? 6 : day - 1; // Dimanche = 6, Lundi = 0
  };

  const getWeekNumber = (date: string) => {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const getLevelColor = (level: 0 | 1 | 2 | 3 | 4) => {
    const colors = [
      '#f3f4f6', // level 0 - gray-100
      '#dbeafe', // level 1 - blue-100
      '#93c5fd', // level 2 - blue-300
      '#3b82f6', // level 3 - blue-500
      '#1e40af'  // level 4 - blue-700
    ];
    return colors[level];
  };

  const getTooltipText = (item: { date: string; value: number; level: 0 | 1 | 2 | 3 | 4 }) => {
    const date = new Date(item.date);
    const dayName = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][date.getDay()];
    const levelText = ['Aucune activité', 'Faible', 'Modérée', 'Élevée', 'Très élevée'][item.level];
    
    return `${dayName} ${date.getDate()} ${monthNames[date.getMonth()]}: ${item.value} exercices (${levelText})`;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Calendrier d'Activité
        </h3>
        <p className="text-sm text-gray-600">
          Votre activité d'apprentissage au cours de l'année
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* En-têtes des jours de la semaine */}
          <div className="flex mb-2">
            <div className="w-8"></div> {/* Espace pour les mois */}
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="w-4 text-xs text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grille du calendrier */}
          {Object.entries(months).map(([monthKey, monthData]) => {
            const year = parseInt(monthKey.split('-')[0]);
            const month = parseInt(monthKey.split('-')[1]) - 1;
            
            // Créer un tableau de 6 semaines x 7 jours
            const weeks: Array<Array<{ date: string; value: number; level: 0 | 1 | 2 | 3 | 4 } | null>> = [];
            for (let week = 0; week < 6; week++) {
              weeks[week] = new Array(7).fill(null);
            }
            
            // Remplir avec les données
            monthData.forEach(item => {
              const dayOfWeek = getDayOfWeek(item.date);
              const weekNumber = getWeekNumber(item.date);
              if (weekNumber < 6) {
                weeks[weekNumber][dayOfWeek] = item;
              }
            });
            
            return (
              <div key={monthKey} className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 text-sm font-medium text-gray-700">
                    {monthNames[month]}
                  </div>
                  <div className="flex">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex">
                        {week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className="w-4 h-4 m-0.5 rounded-sm border border-gray-200"
                            style={{
                              backgroundColor: day ? getLevelColor(day.level) : '#f9fafb'
                            }}
                            title={day ? getTooltipText(day) : ''}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Légende */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Moins
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm border border-gray-200"
              style={{ backgroundColor: getLevelColor(level as 0 | 1 | 2 | 3 | 4) }}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500">
          Plus
        </div>
      </div>
      
      {data.length === 0 && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📅</div>
            <p>Aucune donnée d'activité disponible</p>
          </div>
        </div>
      )}
    </Card>
  );
}
