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
  Bell
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
  loading = false 
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const typeIcons = {
    exercise: BookOpen,
    study: Calendar,
    achievement: Trophy,
    reminder: Bell
  };

  const typeColors = {
    exercise: 'bg-blue-100 text-blue-800 border-blue-200',
    study: 'bg-green-100 text-green-800 border-green-200',
    achievement: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reminder: 'bg-purple-100 text-purple-800 border-purple-200'
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
        events: getEventsForDate(prevDate)
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date)
      });
    }

    // Jours du mois suivant pour remplir la dernière semaine
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalCells; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate)
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(
      currentYear,
      currentMonth + (direction === 'next' ? 1 : -1),
      1
    ));
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{completedToday}</div>
              <div className="text-sm text-gray-600">Complétés aujourd'hui</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{pendingToday}</div>
              <div className="text-sm text-gray-600">En attente aujourd'hui</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigateMonth('prev')}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            
            <Button
              onClick={() => navigateMonth('next')}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              size="sm"
            >
              Aujourd'hui
            </Button>
            
            {selectedDate && onAddEvent && (
              <Button
                onClick={handleAddEvent}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
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
              className={`
                relative p-2 min-h-24 cursor-pointer border border-gray-100 hover:bg-gray-50
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                ${isToday(day.date) ? 'bg-blue-50 border-blue-200' : ''}
                ${isSelected(day.date) ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className={`text-sm font-medium mb-1 ${isToday(day.date) ? 'text-blue-600' : ''}`}>
                {day.date.getDate()}
              </div>

              {/* Événements du jour */}
              <div className="space-y-1">
                {day.events.slice(0, 2).map(event => {
                  const Icon = typeIcons[event.type];
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={`
                        flex items-center gap-1 px-1 py-0.5 rounded text-xs border cursor-pointer
                        ${typeColors[event.type]}
                        ${event.completed ? 'opacity-60 line-through' : ''}
                      `}
                      title={event.title}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{event.title}</span>
                      {event.completed && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                    </div>
                  );
                })}
                
                {day.events.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <div className="text-sm text-gray-600">
              {selectedDateEvents.length} événement(s)
            </div>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun événement prévu pour cette date</p>
              {onAddEvent && (
                <Button
                  onClick={handleAddEvent}
                  className="mt-3"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
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
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-sm
                      ${typeColors[event.type]}
                      ${event.completed ? 'opacity-60' : ''}
                    `}
                    onClick={() => onEventClick?.(event)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${event.completed ? 'line-through' : ''}`}>
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="text-sm mt-1 text-gray-600">
                          {event.description}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {event.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                        )}
                        {event.points > 0 && (
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {event.points} points
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        onEventComplete && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventComplete(event.id);
                            }}
                            size="sm"
                            variant="outline"
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
