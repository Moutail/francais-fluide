'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Clock,
  Target,
  Award,
  Filter,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'exercise' | 'study' | 'achievement' | 'reminder';
  date: string;
  time?: string;
  completed: boolean;
  description?: string;
  points?: number;
}

interface EventFormData {
  title: string;
  type: 'exercise' | 'study' | 'achievement' | 'reminder';
  date: string;
  time: string;
  description: string;
  points: number;
}

export default function CalendarPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState<EventFormData>({
    title: '',
    type: 'exercise',
    date: '',
    time: '',
    description: '',
    points: 0,
  });

  // Rediriger les utilisateurs non connectés
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [loading, isAuthenticated]);

  // Charger les événements
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated, currentDate]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Charger les événements depuis l'API
      const response = await fetch('/api/calendar/events', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      } else {
        // Fallback vers des données de démonstration
        const mockEvents: CalendarEvent[] = [
          {
            id: '1',
            title: 'Exercice de grammaire',
            type: 'exercise',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            completed: true,
            description: 'Accord des participes passés',
            points: 25,
          },
          {
            id: '2',
            title: "Session d'écriture",
            type: 'study',
            date: new Date().toISOString().split('T')[0],
            time: '14:30',
            completed: false,
            description: 'Écrire 200 mots sur un sujet libre',
            points: 50,
          },
        ];
        setEvents(mockEvents);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isToday = currentDate.toDateString() === new Date().toDateString();
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exercise':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'study':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reminder':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return '📚';
      case 'study':
        return '✍️';
      case 'achievement':
        return '🏆';
      case 'reminder':
        return '⏰';
      default:
        return '📅';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleAddEvent = () => {
    if (selectedDate) {
      setEventForm(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
      }));
    }
    setShowEventForm(true);
  };

  const handleEventFormChange = (field: keyof EventFormData, value: string | number) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(eventForm),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent.data]);
        setShowEventForm(false);
        setEventForm({
          title: '',
          type: 'exercise',
          date: '',
          time: '',
          description: '',
          points: 0,
        });
      } else {
        console.error("Erreur lors de l'ajout de l'événement");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error);
    }
  };

  const handleToggleEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev =>
          prev.map(event =>
            event.id === eventId ? { ...event, completed: updatedEvent.data.completed } : event
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
    }
  };

  const filteredEvents = selectedDate
    ? getEventsForDate(selectedDate).filter(
        event => selectedType === 'all' || event.type === selectedType
      )
    : [];

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

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
              <p className="text-gray-600">Planifiez et suivez vos activités d'apprentissage</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Calendrier principal */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Navigation du mois */}
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>

                <button
                  onClick={() => navigateMonth('next')}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1">
                {/* En-têtes des jours */}
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Jours du mois */}
                {getDaysInMonth(currentDate).map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] cursor-pointer border border-gray-200 p-2 transition-colors hover:bg-gray-50 ${
                        !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                      } ${day.isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div
                        className={`mb-1 text-sm font-medium ${day.isToday ? 'text-blue-600' : ''}`}
                      >
                        {day.date.getDate()}
                      </div>

                      {/* Événements du jour */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`rounded border p-1 text-xs ${getEventTypeColor(event.type)} ${
                              event.completed ? 'opacity-75' : ''
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span>{getEventIcon(event.type)}</span>
                              <span className="truncate">{event.title}</span>
                              {event.completed && <CheckCircle className="h-3 w-3 flex-shrink-0" />}
                            </div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} autres
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Événements du jour sélectionné */}
            {selectedDate && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>

                {filteredEvents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEvents.map(event => (
                      <div
                        key={event.id}
                        className={`rounded-lg border p-3 ${getEventTypeColor(event.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span>{getEventIcon(event.type)}</span>
                              <h4 className="font-medium">{event.title}</h4>
                              {event.completed && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            {event.description && (
                              <p className="mb-2 text-sm opacity-75">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs">
                              {event.time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event.time}
                                </div>
                              )}
                              {event.points && (
                                <div className="flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  {event.points} pts
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleEvent(event.id)}
                              className={`rounded p-1 ${
                                event.completed
                                  ? 'text-green-600 hover:bg-green-100'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={
                                event.completed
                                  ? 'Marquer comme non terminé'
                                  : 'Marquer comme terminé'
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="rounded p-1 text-red-400 hover:bg-red-100"
                              title="Supprimer l'événement"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p>Aucun événement ce jour</p>
                  </div>
                )}
              </div>
            )}

            {/* Filtres */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Filtres</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Type d'événement
                  </label>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="exercise">Exercices</option>
                    <option value="study">Étude</option>
                    <option value="achievement">Succès</option>
                    <option value="reminder">Rappels</option>
                  </select>
                </div>

                <button
                  onClick={handleAddEvent}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un événement
                </button>
              </div>
            </div>

            {/* Statistiques du mois */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistiques du mois</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Événements terminés</span>
                  <span className="font-medium text-gray-900">
                    {events.filter(e => e.completed).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points gagnés</span>
                  <span className="font-medium text-gray-900">
                    {events.filter(e => e.completed).reduce((sum, e) => sum + (e.points || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux de réussite</span>
                  <span className="font-medium text-green-600">
                    {events.length > 0
                      ? Math.round((events.filter(e => e.completed).length / events.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout d'événement */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Ajouter un événement</h3>

            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => handleEventFormChange('title', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={eventForm.type}
                  onChange={e => handleEventFormChange('type', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="exercise">Exercice</option>
                  <option value="study">Étude</option>
                  <option value="achievement">Succès</option>
                  <option value="reminder">Rappel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={e => handleEventFormChange('date', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Heure</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={e => handleEventFormChange('time', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={e => handleEventFormChange('description', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Points</label>
                <input
                  type="number"
                  value={eventForm.points}
                  onChange={e => handleEventFormChange('points', parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
