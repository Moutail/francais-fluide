// lib/telemetry.ts - Service de télémétrie pour capturer les interactions utilisateur

interface TelemetryEvent {
  type: string;
  timestamp: number;
  data: any;
  exerciseId?: string;
  questionId?: string;
}

class TelemetryService {
  private events: TelemetryEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 secondes
  private isFlushing = false;

  constructor() {
    // Flush automatique toutes les 30 secondes
    setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush avant de quitter la page
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  // Enregistrer un événement
  track(type: string, data: any, exerciseId?: string, questionId?: string) {
    const event: TelemetryEvent = {
      type,
      timestamp: Date.now(),
      data,
      exerciseId,
      questionId
    };

    this.events.push(event);

    // Flush si on atteint la taille de batch
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  // Envoyer les événements au backend
  async flush() {
    if (this.isFlushing || this.events.length === 0) {
      return;
    }

    this.isFlushing = true;
    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        // Revenir les événements dans la queue si pas de token
        this.events.unshift(...eventsToSend);
        return;
      }

      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ events: eventsToSend })
      });

      if (!response.ok) {
        console.warn('Erreur envoi télémétrie:', response.status);
        // Revenir les événements dans la queue en cas d'erreur
        this.events.unshift(...eventsToSend);
      }
    } catch (error) {
      console.warn('Erreur télémétrie:', error);
      // Revenir les événements dans la queue en cas d'erreur
      this.events.unshift(...eventsToSend);
    } finally {
      this.isFlushing = false;
    }
  }

  // Méthodes spécifiques pour les exercices
  trackExerciseStarted(exerciseId: string, exerciseData: any) {
    this.track('exercise_started', {
      exerciseType: exerciseData.type,
      difficulty: exerciseData.difficulty,
      estimatedTime: exerciseData.estimatedTime
    }, exerciseId);
  }

  trackAnswerSelected(exerciseId: string, questionId: string, answerIndex: number, options: string[]) {
    this.track('answer_selected', {
      answerIndex,
      selectedOption: options[answerIndex],
      totalOptions: options.length
    }, exerciseId, questionId);
  }

  trackAnswerChanged(exerciseId: string, questionId: string, fromIndex: number, toIndex: number, options: string[]) {
    this.track('answer_changed', {
      fromIndex,
      toIndex,
      fromOption: options[fromIndex],
      toOption: options[toIndex],
      totalOptions: options.length
    }, exerciseId, questionId);
  }

  trackQuestionCompleted(exerciseId: string, questionId: string, isCorrect: boolean, responseTime: number, attempts: number) {
    this.track('question_completed', {
      isCorrect,
      responseTime, // en millisecondes
      attempts,
      timestamp: Date.now()
    }, exerciseId, questionId);
  }

  trackQuestionSkipped(exerciseId: string, questionId: string, reason: string) {
    this.track('question_skipped', {
      reason,
      timestamp: Date.now()
    }, exerciseId, questionId);
  }

  trackExerciseFinished(exerciseId: string, score: number, totalQuestions: number, timeSpent: number, accuracy: number) {
    this.track('exercise_finished', {
      score,
      totalQuestions,
      timeSpent, // en secondes
      accuracy,
      timestamp: Date.now()
    }, exerciseId);
  }

  // Méthodes pour l'éditeur
  trackTextInput(textLength: number, wordCount: number, language: string) {
    this.track('text_input', {
      textLength,
      wordCount,
      language,
      timestamp: Date.now()
    });
  }

  trackGrammarCheck(textLength: number, errorCount: number, corrections: any[]) {
    this.track('grammar_check', {
      textLength,
      errorCount,
      correctionsCount: corrections.length,
      timestamp: Date.now()
    });
  }

  // Méthodes pour la navigation
  trackPageView(page: string, timeSpent: number) {
    this.track('page_view', {
      page,
      timeSpent,
      timestamp: Date.now()
    });
  }

  trackFeatureUsed(feature: string, context?: any) {
    this.track('feature_used', {
      feature,
      context,
      timestamp: Date.now()
    });
  }
}

// Instance singleton
export const telemetry = new TelemetryService();

// Hook React pour utiliser la télémétrie
export const useTelemetry = () => {
  return telemetry;
};

export default telemetry;
