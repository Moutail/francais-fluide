'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/professional/Button';
import { Card } from '@/components/ui/professional/Card';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Trophy,
  Bell,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'exercise' | 'study' | 'achievement' | 'reminder';
  date: Date;
  time?: string;
  description?: string;
  points: number;
  completed: boolean;
}

interface CalendarWidgetProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  onEventComplete?: (eventId: string) => void;
  loading?: boolean;
}

export default function CalendarWidget({
  events = [],
  onEventClick,
  onAddEvent,
  onEventComplete,
  loading = false,
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const typeIcons = {
    exercise: BookOpen,
    study: Calendar,
    achievement: Trophy,
    reminder: Bell,
  };

  const typeColors = {
    exercise: 'bg-blue-100 text-blue-800 border-blue-200',
    study: 'bg-green-100 text-green-800 border-green-200',
    achievement: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reminder: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent pour remplir la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: getEventsForDate(prevDate),
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
      });
    }

    // Jours du mois suivant pour remplir la dernière semaine
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalCells; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate),
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => event.date.toDateString() === date.toDateString());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    if (selectedDate && onAddEvent) {
      onAddEvent(selectedDate);
    }
  };

  const days = getDaysInMonth();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Statistiques rapides
  const todayEvents = getEventsForDate(today);
  const completedToday = todayEvents.filter(e => e.completed).length;
  const pendingToday = todayEvents.filter(e => !e.completed).length;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{completedToday}</div>
              <div className="text-sm text-gray-600">Complétés aujourd'hui</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{pendingToday}</div>
              <div className="text-sm text-gray-600">En attente aujourd'hui</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.completed).reduce((sum, e) => sum + e.points, 0)}
              </div>
              <div className="text-sm text-gray-600">Points gagnés</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendrier principal */}
      <Card className="p-6">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigateMonth('prev')} variant="secondary" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>

            <Button onClick={() => navigateMonth('next')} variant="secondary" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setCurrentDate(new Date())} variant="secondary" size="sm">
              Aujourd'hui
            </Button>

            {selectedDate && onAddEvent && (
              <Button onClick={handleAddEvent} size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            )}
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {/* En-têtes des jours */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}

          {/* Jours */}
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day.date)}
              className={`relative min-h-24 cursor-pointer border border-gray-100 p-2 hover:bg-gray-50 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} ${isToday(day.date) ? 'border-blue-200 bg-blue-50' : ''} ${isSelected(day.date) ? 'ring-2 ring-blue-500' : ''} `}
            >
              <div
                className={`mb-1 text-sm font-medium ${isToday(day.date) ? 'text-blue-600' : ''}`}
              >
                {day.date.getDate()}
              </div>

              {/* Événements du jour */}
              <div className="space-y-1">
                {day.events.slice(0, 2).map(event => {
                  const Icon = typeIcons[event.type];
                  return (
                    <div
                      key={event.id}
                      onClick={e => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={`flex cursor-pointer items-center gap-1 rounded border px-1 py-0.5 text-xs ${typeColors[event.type]} ${event.completed ? 'line-through opacity-60' : ''} `}
                      title={event.title}
                    >
                      <Icon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{event.title}</span>
                      {event.completed && <CheckCircle className="h-3 w-3 flex-shrink-0" />}
                    </div>
                  );
                })}

                {day.events.length > 2 && (
                  <div className="text-center text-xs text-gray-500">
                    +{day.events.length - 2} autres
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Détails de la date sélectionnée */}
      {selectedDate && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <div className="text-sm text-gray-600">{selectedDateEvents.length} événement(s)</div>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>Aucun événement prévu pour cette date</p>
              {onAddEvent && (
                <Button onClick={handleAddEvent} className="mt-3" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter un événement
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map(event => {
                const Icon = typeIcons[event.type];
                return (
                  <div
                    key={event.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:shadow-sm ${typeColors[event.type]} ${event.completed ? 'opacity-60' : ''} `}
                    onClick={() => onEventClick?.(event)}
                  >
                    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium ${event.completed ? 'line-through' : ''}`}>
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="mt-1 text-sm text-gray-600">{event.description}</div>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        {event.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </div>
                        )}
                        {event.points > 0 && (
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {event.points} points
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        onEventComplete && (
                          <Button
                            onClick={e => {
                              e.stopPropagation();
                              onEventComplete(event.id);
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            Terminer
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
