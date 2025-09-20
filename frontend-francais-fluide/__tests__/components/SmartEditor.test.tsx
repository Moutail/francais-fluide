/**
 * Tests complets pour le composant SmartEditor
 * Teste les fonctionnalités principales : saisie, correction, suggestions, métriques
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartEditor } from '@/components/editor/SmartEditor';
import { useGrammarCheck } from '@/hooks/useGrammarCheck';

// Mock du hook useGrammarCheck
jest.mock('@/hooks/useGrammarCheck');
const mockUseGrammarCheck = useGrammarCheck as jest.MockedFunction<typeof useGrammarCheck>;

// Mock du hook useDebounce
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value, // Retourne directement la valeur pour les tests
}));

describe('SmartEditor', () => {
  const mockCheckGrammar = jest.fn();
  const mockOnProgressUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGrammarCheck.mockReturnValue({
      checkGrammar: mockCheckGrammar,
      isChecking: false,
    });
  });

  describe('Rendu initial', () => {
    it('affiche le composant avec les valeurs par défaut', () => {
      render(<SmartEditor />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Commencez à écrire/)).toBeInTheDocument();
      expect(screen.getByText('0 mots')).toBeInTheDocument();
      expect(screen.getByText('Mode Entraînement')).toBeInTheDocument();
    });

    it('affiche les props personnalisées', () => {
      render(
        <SmartEditor
          initialValue="Texte initial"
          placeholder="Placeholder personnalisé"
          mode="exam"
        />
      );
      
      expect(screen.getByDisplayValue('Texte initial')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Placeholder personnalisé')).toBeInTheDocument();
      expect(screen.getByText('Mode Examen')).toBeInTheDocument();
    });
  });

  describe('Saisie de texte', () => {
    it('met à jour le texte lors de la saisie', async () => {
      const user = userEvent.setup();
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Bonjour le monde');
      
      expect(textarea).toHaveValue('Bonjour le monde');
    });

    it('compte correctement les mots', async () => {
      const user = userEvent.setup();
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Un deux trois quatre cinq');
      
      await waitFor(() => {
        expect(screen.getByText('5 mots')).toBeInTheDocument();
      });
    });

    it('appelle onProgressUpdate avec les métriques', async () => {
      const user = userEvent.setup();
      render(<SmartEditor onProgressUpdate={mockOnProgressUpdate} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Texte de test');
      
      await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            wordsWritten: expect.any(Number),
            errorsDetected: expect.any(Number),
            errorsCorrected: expect.any(Number),
            accuracyRate: expect.any(Number),
            streakCount: expect.any(Number),
          })
        );
      });
    });
  });

  describe('Correction grammaticale', () => {
    it('déclenche l\'analyse après la saisie', async () => {
      const user = userEvent.setup();
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 3, errorCount: 0 }
      });

      render(<SmartEditor realTimeCorrection={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Texte de test');
      
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalledWith('Texte de test');
      });
    });

    it('affiche les erreurs détectées', async () => {
      const user = userEvent.setup();
      const mockErrors = [
        {
          offset: 0,
          length: 6,
          message: 'Erreur de conjugaison',
          replacements: ['mange'],
          rule: {
            id: 'test-rule',
            category: 'grammar',
            severity: 'critical'
          },
          context: { text: 'manger', offset: 0, length: 6 }
        }
      ];

      mockCheckGrammar.mockResolvedValue({
        errors: mockErrors,
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain');
      
      await waitFor(() => {
        expect(screen.getByText('1 suggestion')).toBeInTheDocument();
      });
    });

    it('affiche l\'indicateur d\'analyse pendant la vérification', async () => {
      const user = userEvent.setup();
      mockUseGrammarCheck.mockReturnValue({
        checkGrammar: mockCheckGrammar,
        isChecking: true,
      });

      render(<SmartEditor />);
      
      expect(screen.getByText('Analyse...')).toBeInTheDocument();
    });

    it('ne déclenche pas l\'analyse si le texte est trop court', async () => {
      const user = userEvent.setup();
      render(<SmartEditor realTimeCorrection={true} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'ab');
      
      // Attendre un peu pour s'assurer que l'analyse ne se déclenche pas
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockCheckGrammar).not.toHaveBeenCalled();
    });
  });

  describe('Système de suggestions', () => {
    it('affiche le panneau de suggestions lors du clic sur une erreur', async () => {
      const user = userEvent.setup();
      const mockErrors = [
        {
          offset: 0,
          length: 6,
          message: 'Erreur de conjugaison',
          replacements: ['mange', 'mangé'],
          rule: {
            id: 'test-rule',
            category: 'grammar',
            severity: 'critical'
          },
          context: { text: 'manger', offset: 0, length: 6 }
        }
      ];

      mockCheckGrammar.mockResolvedValue({
        errors: mockErrors,
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Erreur de conjugaison')).toBeInTheDocument();
        expect(screen.getByText('mange')).toBeInTheDocument();
        expect(screen.getByText('mangé')).toBeInTheDocument();
      });
    });

    it('applique une suggestion lors du clic', async () => {
      const user = userEvent.setup();
      const mockErrors = [
        {
          offset: 0,
          length: 6,
          message: 'Erreur de conjugaison',
          replacements: ['mange'],
          rule: {
            id: 'test-rule',
            category: 'grammar',
            severity: 'critical'
          },
          context: { text: 'manger', offset: 0, length: 6 }
        }
      ];

      mockCheckGrammar.mockResolvedValue({
        errors: mockErrors,
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        const suggestionButton = screen.getByText('mange');
        fireEvent.click(suggestionButton);
      });
      
      await waitFor(() => {
        expect(textarea).toHaveValue('mange du pain');
      });
    });

    it('ferme le panneau de suggestions lors du clic sur "Ignorer"', async () => {
      const user = userEvent.setup();
      const mockErrors = [
        {
          offset: 0,
          length: 6,
          message: 'Erreur de conjugaison',
          replacements: ['mange'],
          rule: {
            id: 'test-rule',
            category: 'grammar',
            severity: 'critical'
          },
          context: { text: 'manger', offset: 0, length: 6 }
        }
      ];

      mockCheckGrammar.mockResolvedValue({
        errors: mockErrors,
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        const ignoreButton = screen.getByText('Ignorer');
        fireEvent.click(ignoreButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Erreur de conjugaison')).not.toBeInTheDocument();
      });
    });
  });

  describe('Métriques et performance', () => {
    it('calcule correctement le taux de précision', async () => {
      const user = userEvent.setup();
      const mockErrors = [
        {
          offset: 0,
          length: 6,
          message: 'Erreur',
          replacements: ['correction'],
          rule: {
            id: 'test-rule',
            category: 'grammar',
            severity: 'critical'
          },
          context: { text: 'manger', offset: 0, length: 6 }
        }
      ];

      mockCheckGrammar.mockResolvedValue({
        errors: mockErrors,
        statistics: { wordCount: 10, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain avec du beurre et du fromage');
      
      await waitFor(() => {
        expect(screen.getByText('90% précision')).toBeInTheDocument();
      });
    });

    it('affiche le streak de perfection', async () => {
      const user = userEvent.setup();
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 10, errorCount: 0 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Simuler plusieurs phrases parfaites
      for (let i = 0; i < 3; i++) {
        await user.clear(textarea);
        await user.type(textarea, 'Voici une phrase parfaite sans erreurs.');
        await waitFor(() => {
          expect(mockCheckGrammar).toHaveBeenCalled();
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText(/parfait/)).toBeInTheDocument();
      });
    });

    it('affiche les bonnes couleurs selon la précision', async () => {
      const user = userEvent.setup();
      
      // Test précision élevée (verte)
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 10, errorCount: 0 }
      });

      const { rerender } = render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Phrase parfaite sans erreurs');
      
      await waitFor(() => {
        const precisionIndicator = screen.getByText('100% précision');
        expect(precisionIndicator.closest('div')).toHaveClass('bg-green-100');
      });
    });
  });

  describe('Modes de fonctionnement', () => {
    it('affiche le bon mode selon la prop', () => {
      const modes = ['practice', 'exam', 'creative'] as const;
      
      modes.forEach(mode => {
        const { unmount } = render(<SmartEditor mode={mode} />);
        
        const expectedText = mode === 'practice' ? 'Entraînement' :
                           mode === 'exam' ? 'Examen' : 'Créatif';
        
        expect(screen.getByText(`Mode ${expectedText}`)).toBeInTheDocument();
        unmount();
      });
    });

    it('désactive la correction en temps réel si spécifié', async () => {
      const user = userEvent.setup();
      render(<SmartEditor realTimeCorrection={false} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Texte de test');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockCheckGrammar).not.toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
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

    it('réinitialise la sélection d\'erreur lors de la modification du texte', async () => {
      const user = userEvent.setup();
      const mockErrors = [
        {
          offset: 0,
          length: 6,
          message: 'Erreur',
          replacements: ['correction'],
          rule: {
            id: 'test-rule',
            category: 'grammar',
            severity: 'critical'
          },
          context: { text: 'manger', offset: 0, length: 6 }
        }
      ];

      mockCheckGrammar.mockResolvedValue({
        errors: mockErrors,
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Erreur')).toBeInTheDocument();
      });
      
      // Modifier le texte
      await user.type(textarea, 'x');
      
      await waitFor(() => {
        expect(screen.queryByText('Erreur')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibilité', () => {
    it('a un textarea accessible', () => {
      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder');
    });

    it('a des boutons de suggestion accessibles', async () => {
      const user = userEvent.setup();
      const mockErrors = [
        {
          offset: 0,
          length: 6,
          message: 'Erreur',
          replacements: ['correction'],
          rule: {
            id: 'test-rule',
            category: 'grammar',
            severity: 'critical'
          },
          context: { text: 'manger', offset: 0, length: 6 }
        }
      ];

      mockCheckGrammar.mockResolvedValue({
        errors: mockErrors,
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        const suggestionButton = screen.getByText('correction');
        expect(suggestionButton).toBeInTheDocument();
        expect(suggestionButton.closest('button')).toBeInTheDocument();
      });
    });
  });
});
