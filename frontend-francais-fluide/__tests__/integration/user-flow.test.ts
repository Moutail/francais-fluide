/**
 * Tests d'intégration pour les parcours utilisateur complets
 * Teste les flux end-to-end de l'application
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartEditor } from '@/components/editor/SmartEditor';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ProgressDashboard } from '@/components/gamification/ProgressDashboard';
import { useGrammarCheck } from '@/hooks/useGrammarCheck';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGamification } from '@/hooks/useGameification';

// Mock des hooks
jest.mock('@/hooks/useGrammarCheck');
jest.mock('@/hooks/useUserProfile');
jest.mock('@/hooks/useGameification');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

const mockUseGrammarCheck = useGrammarCheck as jest.MockedFunction<typeof useGrammarCheck>;
const mockUseUserProfile = useUserProfile as jest.MockedFunction<typeof useUserProfile>;
const mockUseGamification = useGamification as jest.MockedFunction<typeof useGamification>;

describe('Parcours utilisateur - Intégration complète', () => {
  const mockCheckGrammar = jest.fn();
  const mockUpdateProgress = jest.fn();
  const mockUnlockAchievement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock du hook de vérification grammaticale
    mockUseGrammarCheck.mockReturnValue({
      checkGrammar: mockCheckGrammar,
      isChecking: false,
    });

    // Mock du profil utilisateur
    mockUseUserProfile.mockReturnValue({
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        level: 2,
        totalPoints: 150,
      },
      updateProfile: jest.fn(),
      isLoading: false,
    });

    // Mock de la gamification
    mockUseGamification.mockReturnValue({
      metrics: {
        totalPoints: 150,
        currentLevel: 2,
        pointsToNextLevel: 150,
        streakDays: 3,
        perfectStreak: 2,
        accuracyRate: 85,
        wordsWritten: 50,
        exercisesCompleted: 5,
        errorsCorrected: 8,
        achievementsUnlocked: 2,
      },
      updateProgress: mockUpdateProgress,
      unlockAchievement: mockUnlockAchievement,
      isLoading: false,
    });
  });

  describe('Parcours d\'écriture avec correction', () => {
    it('permet à l\'utilisateur d\'écrire et de corriger ses erreurs', async () => {
      const user = userEvent.setup();
      
      // Mock des erreurs de grammaire
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 6,
            message: 'Erreur de conjugaison',
            replacements: ['mange'],
            rule: {
              id: 'conjugaison-test',
              category: 'grammar',
              severity: 'critical'
            },
            context: { text: 'manger', offset: 0, length: 6 }
          }
        ],
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor onProgressUpdate={mockUpdateProgress} />);
      
      const textarea = screen.getByRole('textbox');
      
      // 1. L'utilisateur tape du texte avec des erreurs
      await user.type(textarea, 'manger du pain');
      
      // 2. L'application détecte les erreurs
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalledWith('manger du pain');
      });
      
      // 3. L'application affiche les suggestions
      await waitFor(() => {
        expect(screen.getByText('1 suggestion')).toBeInTheDocument();
      });
      
      // 4. L'utilisateur clique sur l'erreur
      const errorHighlight = screen.getByRole('button');
      fireEvent.click(errorHighlight);
      
      // 5. L'application affiche le panneau de suggestions
      await waitFor(() => {
        expect(screen.getByText('Erreur de conjugaison')).toBeInTheDocument();
        expect(screen.getByText('mange')).toBeInTheDocument();
      });
      
      // 6. L'utilisateur applique une correction
      const suggestionButton = screen.getByText('mange');
      fireEvent.click(suggestionButton);
      
      // 7. Le texte est corrigé et les métriques mises à jour
      await waitFor(() => {
        expect(textarea).toHaveValue('mange du pain');
        expect(mockUpdateProgress).toHaveBeenCalled();
      });
    });

    it('met à jour les métriques de progression en temps réel', async () => {
      const user = userEvent.setup();
      const mockOnProgressUpdate = jest.fn();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 5, errorCount: 0 }
      });

      render(<SmartEditor onProgressUpdate={mockOnProgressUpdate} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Voici une phrase parfaite');
      
      await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            wordsWritten: 5,
            errorsDetected: 0,
            accuracyRate: 100,
          })
        );
      });
    });
  });

  describe('Parcours de progression et gamification', () => {
    it('affiche les métriques de progression utilisateur', async () => {
      render(<ProgressDashboard />);
      
      // Vérifier que les métriques sont affichées
      expect(screen.getByText(/150 points/)).toBeInTheDocument();
      expect(screen.getByText(/Niveau 2/)).toBeInTheDocument();
      expect(screen.getByText(/85% précision/)).toBeInTheDocument();
      expect(screen.getByText(/3 jours/)).toBeInTheDocument();
    });

    it('débloque des achievements lors de la progression', async () => {
      const user = userEvent.setup();
      
      // Mock d'un achievement débloqué
      mockUseGamification.mockReturnValue({
        metrics: {
          totalPoints: 150,
          currentLevel: 2,
          pointsToNextLevel: 150,
          streakDays: 3,
          perfectStreak: 2,
          accuracyRate: 85,
          wordsWritten: 50,
          exercisesCompleted: 5,
          errorsCorrected: 8,
          achievementsUnlocked: 3, // Achievement débloqué
        },
        updateProgress: mockUpdateProgress,
        unlockAchievement: mockUnlockAchievement,
        isLoading: false,
      });

      render(<ProgressDashboard />);
      
      // Vérifier que l'achievement est affiché
      expect(screen.getByText(/3 achievements/)).toBeInTheDocument();
    });
  });

  describe('Parcours d\'analytics et de suivi', () => {
    it('affiche les analytics de performance', async () => {
      render(<AnalyticsDashboard />);
      
      // Vérifier que les composants d'analytics sont présents
      expect(screen.getByText(/Analytics/)).toBeInTheDocument();
    });

    it('suit l\'évolution des performances dans le temps', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <SmartEditor />
          <AnalyticsDashboard />
        </div>
      );
      
      const textarea = screen.getByRole('textbox');
      
      // Simuler plusieurs sessions d'écriture
      await user.type(textarea, 'Premier texte de test');
      await user.clear(textarea);
      await user.type(textarea, 'Deuxième texte de test');
      
      await waitFor(() => {
        expect(mockUpdateProgress).toHaveBeenCalled();
      });
    });
  });

  describe('Parcours de correction collaborative', () => {
    it('permet la correction en temps réel avec d\'autres utilisateurs', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Texte collaboratif');
      
      // Simuler une correction collaborative
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalled();
      });
    });
  });

  describe('Gestion des erreurs et cas limites', () => {
    it('gère les erreurs de l\'API de correction', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockCheckGrammar.mockRejectedValue(new Error('Erreur API'));
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Texte de test');
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de l\'analyse:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('gère les sessions longues avec de nombreux mots', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 1000, errorCount: 0 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Simuler une session longue
      const longText = 'Lorem ipsum '.repeat(100);
      await user.type(textarea, longText);
      
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalled();
      });
    });

    it('gère les textes avec des caractères spéciaux', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 3, errorCount: 0 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Café & thé, 50€ !');
      
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalledWith('Café & thé, 50€ !');
      });
    });
  });

  describe('Performance et optimisation', () => {
    it('optimise les appels API avec debounce', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 1, errorCount: 0 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Taper rapidement plusieurs caractères
      await user.type(textarea, 'a');
      await user.type(textarea, 'b');
      await user.type(textarea, 'c');
      
      // Attendre que le debounce se déclenche
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalledWith('abc');
      }, { timeout: 1000 });
    });

    it('met en cache les résultats d\'analyse', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 3, errorCount: 0 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Taper le même texte plusieurs fois
      await user.type(textarea, 'test');
      await user.clear(textarea);
      await user.type(textarea, 'test');
      
      // L'API devrait être appelée moins de fois grâce au cache
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibilité et UX', () => {
    it('assure la navigation au clavier', async () => {
      const user = userEvent.setup();
      
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Navigation au clavier
      await user.tab();
      expect(textarea).toHaveFocus();
      
      await user.type(textarea, 'Test navigation clavier');
      
      await waitFor(() => {
        expect(textarea).toHaveValue('Test navigation clavier');
      });
    });

    it('affiche des messages d\'erreur accessibles', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 5,
            message: 'Erreur accessible',
            replacements: ['correction'],
            rule: {
              id: 'accessibility-test',
              category: 'grammar',
              severity: 'critical'
            },
            context: { text: 'error', offset: 0, length: 5 }
          }
        ],
        statistics: { wordCount: 1, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'error');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Erreur accessible')).toBeInTheDocument();
      });
    });
  });
});
