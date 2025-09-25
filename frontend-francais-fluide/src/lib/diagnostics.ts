// src/lib/diagnostics.ts
// Système de diagnostic pour la communication avec le serveur

export interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export class ServerDiagnostics {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  async runFullDiagnostic(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Test 1: Vérifier la connectivité du serveur
    results.push(await this.testServerConnectivity());

    // Test 2: Vérifier l'authentification
    results.push(await this.testAuthentication());

    // Test 3: Vérifier l'API de progression
    results.push(await this.testProgressAPI());

    // Test 4: Vérifier la base de données
    results.push(await this.testDatabaseConnection());

    return results;
  }

  private async testServerConnectivity(): Promise<DiagnosticResult> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          test: 'Connectivité serveur',
          status: 'success',
          message: 'Serveur accessible',
          details: { status: response.status }
        };
      } else {
        return {
          test: 'Connectivité serveur',
          status: 'error',
          message: `Serveur répond avec le statut ${response.status}`,
          details: { status: response.status }
        };
      }
    } catch (error) {
      return {
        test: 'Connectivité serveur',
        status: 'error',
        message: 'Impossible de joindre le serveur',
        details: { error: error instanceof Error ? error.message : 'Erreur inconnue' }
      };
    }
  }

  private async testAuthentication(): Promise<DiagnosticResult> {
    if (!this.token) {
      return {
        test: 'Authentification',
        status: 'warning',
        message: 'Aucun token d\'authentification trouvé',
        details: { hasToken: false }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          test: 'Authentification',
          status: 'success',
          message: 'Token valide',
          details: { user: data.user?.name || 'Utilisateur inconnu' }
        };
      } else {
        return {
          test: 'Authentification',
          status: 'error',
          message: 'Token invalide ou expiré',
          details: { status: response.status }
        };
      }
    } catch (error) {
      return {
        test: 'Authentification',
        status: 'error',
        message: 'Erreur lors de la vérification du token',
        details: { error: error instanceof Error ? error.message : 'Erreur inconnue' }
      };
    }
  }

  private async testProgressAPI(): Promise<DiagnosticResult> {
    if (!this.token) {
      return {
        test: 'API Progression',
        status: 'warning',
        message: 'Impossible de tester sans token',
        details: { hasToken: false }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/progress`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          test: 'API Progression',
          status: 'success',
          message: 'API de progression fonctionnelle',
          details: { 
            hasData: !!data.data,
            progressKeys: data.data ? Object.keys(data.data) : []
          }
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          test: 'API Progression',
          status: 'error',
          message: `Erreur API progression: ${errorData.error || response.statusText}`,
          details: { status: response.status, error: errorData.error }
        };
      }
    } catch (error) {
      return {
        test: 'API Progression',
        status: 'error',
        message: 'Erreur de connexion à l\'API progression',
        details: { error: error instanceof Error ? error.message : 'Erreur inconnue' }
      };
    }
  }

  private async testDatabaseConnection(): Promise<DiagnosticResult> {
    if (!this.token) {
      return {
        test: 'Base de données',
        status: 'warning',
        message: 'Impossible de tester sans token',
        details: { hasToken: false }
      };
    }

    try {
      // Tester en créant une progression temporaire
      const response = await fetch(`${this.baseUrl}/api/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordsWritten: 0,
          accuracy: 0,
          exercisesCompleted: 0,
          currentStreak: 0,
          level: 1,
          xp: 0,
          timeSpent: 0
        })
      });

      if (response.ok) {
        return {
          test: 'Base de données',
          status: 'success',
          message: 'Connexion à la base de données OK',
          details: { status: response.status }
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          test: 'Base de données',
          status: 'error',
          message: `Erreur base de données: ${errorData.error || response.statusText}`,
          details: { status: response.status, error: errorData.error }
        };
      }
    } catch (error) {
      return {
        test: 'Base de données',
        status: 'error',
        message: 'Impossible de se connecter à la base de données',
        details: { error: error instanceof Error ? error.message : 'Erreur inconnue' }
      };
    }
  }

  // Méthode pour afficher les résultats de diagnostic
  static formatDiagnosticResults(results: DiagnosticResult[]): string {
    let output = '🔍 DIAGNOSTIC SERVEUR\n';
    output += '='.repeat(50) + '\n\n';

    results.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'error' ? '❌' : '⚠️';
      
      output += `${index + 1}. ${icon} ${result.test}\n`;
      output += `   ${result.message}\n`;
      
      if (result.details) {
        output += `   Détails: ${JSON.stringify(result.details, null, 2)}\n`;
      }
      output += '\n';
    });

    return output;
  }
}

// Hook React pour utiliser les diagnostics
export function useServerDiagnostics() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [results, setResults] = React.useState<DiagnosticResult[]>([]);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const diagnostics = new ServerDiagnostics();
    const diagnosticResults = await diagnostics.runFullDiagnostic();
    setResults(diagnosticResults);
    setIsRunning(false);
  };

  return {
    isRunning,
    results,
    runDiagnostic,
    formatResults: () => ServerDiagnostics.formatDiagnosticResults(results)
  };
}
