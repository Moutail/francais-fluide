// lib/errorLogger.ts - Système de logging persistant pour capturer les erreurs

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  category: string;
  message: string;
  details?: any;
  stack?: string;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Garder seulement les 100 derniers logs

  constructor() {
    // Charger les logs existants depuis localStorage
    this.loadLogs();

    // Sauvegarder les logs toutes les 30 secondes
    setInterval(() => {
      this.saveLogs();
    }, 30000);

    // Sauvegarder les logs avant de quitter la page
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveLogs();
      });
    }
  }

  private loadLogs() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('error_logs');
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Impossible de charger les logs:', error);
      }
    }
  }

  private saveLogs() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('error_logs', JSON.stringify(this.logs));
      } catch (error) {
        console.warn('Impossible de sauvegarder les logs:', error);
      }
    }
  }

  private addLog(
    level: LogEntry['level'],
    category: string,
    message: string,
    details?: any,
    stack?: string
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      stack,
    };

    this.logs.unshift(logEntry);

    // Garder seulement les derniers logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Afficher dans la console pour le debug
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${category}] ${message}`,
      details || ''
    );

    // Sauvegarder immédiatement pour les erreurs critiques
    if (level === 'error') {
      this.saveLogs();
    }
  }

  error(category: string, message: string, details?: any, error?: Error) {
    this.addLog('error', category, message, details, error?.stack);
  }

  warn(category: string, message: string, details?: any) {
    this.addLog('warn', category, message, details);
  }

  info(category: string, message: string, details?: any) {
    this.addLog('info', category, message, details);
  }

  debug(category: string, message: string, details?: any) {
    this.addLog('debug', category, message, details);
  }

  // Récupérer les logs
  getLogs(level?: LogEntry['level'], category?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  // Récupérer les erreurs récentes
  getRecentErrors(limit = 10): LogEntry[] {
    return this.logs.filter(log => log.level === 'error').slice(0, limit);
  }

  // Nettoyer les logs
  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  // Exporter les logs pour debug
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Afficher les logs dans la console
  showLogs() {
    console.group("📋 Logs d'erreurs récents");
    this.getRecentErrors(20).forEach(log => {
      console.log(
        `[${log.timestamp}] ${log.level.toUpperCase()} - ${log.category}: ${log.message}`,
        log.details || ''
      );
    });
    console.groupEnd();
  }
}

// Instance singleton
export const errorLogger = new ErrorLogger();

// Fonction utilitaire pour logger les erreurs d'API
export const logApiError = (endpoint: string, error: any, details?: any) => {
  errorLogger.error(
    'API',
    `Erreur sur ${endpoint}`,
    {
      endpoint,
      error: error?.message || error,
      status: error?.status,
      details,
    },
    error
  );
};

// Fonction utilitaire pour logger les erreurs d'authentification
export const logAuthError = (action: string, error: any, details?: any) => {
  errorLogger.error(
    'AUTH',
    `Erreur ${action}`,
    {
      action,
      error: error?.message || error,
      details,
    },
    error
  );
};

export default errorLogger;
