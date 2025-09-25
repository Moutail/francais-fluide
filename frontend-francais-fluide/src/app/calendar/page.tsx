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
  Filter
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
    points: 0
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
            points: 25
          },
          {
            id: '2',
            title: 'Session d\'écriture',
            type: 'study',
            date: new Date().toISOString().split('T')[0],
            time: '14:30',
            completed: false,
            description: 'Écrire 200 mots sur un sujet libre',
            points: 50
          }
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
        isToday: false
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isToday = currentDate.toDateString() === new Date().toDateString();
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday
      });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false
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
      case 'exercise': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'study': return 'bg-green-100 text-green-800 border-green-200';
      case 'achievement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reminder': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exercise': return '📚';
      case 'study': return '✍️';
      case 'achievement': return '🏆';
      case 'reminder': return '⏰';
      default: return '📅';
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
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
    setShowEventForm(true);
  };

  const handleEventFormChange = (field: keyof EventFormData, value: string | number) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventForm)
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
          points: 0
        });
      } else {
        console.error('Erreur lors de l\'ajout de l\'événement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement:', error);
    }
  };

  const handleToggleEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, completed: updatedEvent.data.completed }
              : event
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
    }
  };

  const filteredEvents = selectedDate 
    ? getEventsForDate(selectedDate).filter(event => 
        selectedType === 'all' || event.type === selectedType
      )
    : [];

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
              <p className="text-gray-600">Planifiez et suivez vos activités d'apprentissage</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Navigation du mois */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
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
                      className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                      } ${day.isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isToday ? 'text-blue-600' : ''
                      }`}>
                        {day.date.getDate()}
                      </div>
                      
                      {/* Événements du jour */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} ${
                              event.completed ? 'opacity-75' : ''
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span>{getEventIcon(event.type)}</span>
                              <span className="truncate">{event.title}</span>
                              {event.completed && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>

                {filteredEvents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEvents.map(event => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{getEventIcon(event.type)}</span>
                              <h4 className="font-medium">{event.title}</h4>
                              {event.completed && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm opacity-75 mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs">
                              {event.time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {event.time}
                                </div>
                              )}
                              {event.points && (
                                <div className="flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  {event.points} pts
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleEvent(event.id)}
                              className={`p-1 rounded ${
                                event.completed 
                                  ? 'text-green-600 hover:bg-green-100' 
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={event.completed ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1 text-red-400 hover:bg-red-100 rounded"
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
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun événement ce jour</p>
                  </div>
                )}
              </div>
            )}

            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'événement
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un événement
                </button>
              </div>
            </div>

            {/* Statistiques du mois */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du mois</h3>
              
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
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout d'événement */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter un événement
            </h3>
            
            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => handleEventFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={eventForm.type}
                  onChange={(e) => handleEventFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="exercise">Exercice</option>
                  <option value="study">Étude</option>
                  <option value="achievement">Succès</option>
                  <option value="reminder">Rappel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => handleEventFormChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => handleEventFormChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => handleEventFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={eventForm.points}
                  onChange={(e) => handleEventFormChange('points', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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

