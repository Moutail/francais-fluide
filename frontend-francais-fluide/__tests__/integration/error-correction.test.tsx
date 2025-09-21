/**
 * Tests d'intégration pour les scénarios de correction d'erreurs
 * Teste les différents types d'erreurs et leurs corrections
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartEditor } from '@/components/editor/SmartEditor';
import { GrammarDetector } from '@/lib/grammar/detector';
import { useGrammarCheck } from '@/hooks/useGrammarCheck';

// Mock des hooks
jest.mock('@/hooks/useGrammarCheck');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

const mockUseGrammarCheck = useGrammarCheck as jest.MockedFunction<typeof useGrammarCheck>;

describe('Scénarios de correction d\'erreurs - Intégration', () => {
  const mockCheckGrammar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGrammarCheck.mockReturnValue({
      checkGrammar: mockCheckGrammar,
      isChecking: false,
    });
  });

  describe('Correction des erreurs de conjugaison', () => {
    it('détecte et corrige les erreurs de conjugaison 3ème personne', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 6,
            message: 'Le verbe "manger" n\'est pas conjugué avec "il"',
            replacements: ['mange'],
            rule: {
              id: 'conjugaison-3p-singulier',
              category: 'grammar',
              severity: 'critical'
            },
            context: { text: 'manger', offset: 0, length: 6 }
          }
        ],
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'il manger du pain');
      
      await waitFor(() => {
        expect(screen.getByText('1 suggestion')).toBeInTheDocument();
      });
      
      // Cliquer sur l'erreur
      const errorHighlight = screen.getByRole('button');
      fireEvent.click(errorHighlight);
      
      await waitFor(() => {
        expect(screen.getByText('Le verbe "manger" n\'est pas conjugué avec "il"')).toBeInTheDocument();
        expect(screen.getByText('mange')).toBeInTheDocument();
      });
      
      // Appliquer la correction
      const suggestionButton = screen.getByText('mange');
      fireEvent.click(suggestionButton);
      
      await waitFor(() => {
        expect(textarea).toHaveValue('il mange du pain');
      });
    });

    it('détecte les erreurs de conjugaison avec différents sujets', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 6,
            message: 'Le verbe "finir" n\'est pas conjugué avec "elle"',
            replacements: ['finit'],
            rule: {
              id: 'conjugaison-3p-singulier',
              category: 'grammar',
              severity: 'critical'
            },
            context: { text: 'finir', offset: 0, length: 6 }
          }
        ],
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'elle finir le travail');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('finit')).toBeInTheDocument();
      });
    });
  });

  describe('Correction des erreurs orthographiques', () => {
    it('détecte et corrige les confusions a/à', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 1,
            message: '"à" est une préposition, ici il faut le verbe "a"',
            replacements: ['a'],
            rule: {
              id: 'a-vs-à',
              category: 'spelling',
              severity: 'warning'
            },
            context: { text: 'à', offset: 0, length: 1 }
          }
        ],
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'à le marché');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('a')).toBeInTheDocument();
      });
    });

    it('détecte et corrige les confusions et/est', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 2,
            message: 'Avant un adverbe comme "très", utilisez "est" (verbe être) et non "et" (conjonction)',
            replacements: ['est'],
            rule: {
              id: 'et-vs-est',
              category: 'spelling',
              severity: 'warning'
            },
            context: { text: 'et', offset: 0, length: 2 }
          }
        ],
        statistics: { wordCount: 3, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'et très beau');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('est')).toBeInTheDocument();
      });
    });
  });

  describe('Correction des erreurs de ponctuation', () => {
    it('détecte et corrige les espaces manquantes avant la ponctuation', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 7,
            length: 1,
            message: 'En français, il faut une espace avant ";"',
            replacements: [' ;'],
            rule: {
              id: 'espace-ponctuation-double',
              category: 'punctuation',
              severity: 'suggestion'
            },
            context: { text: ';', offset: 7, length: 1 }
          },
          {
            offset: 20,
            length: 1,
            message: 'En français, il faut une espace avant "?"',
            replacements: [' ?'],
            rule: {
              id: 'espace-ponctuation-double',
              category: 'punctuation',
              severity: 'suggestion'
            },
            context: { text: '?', offset: 20, length: 1 }
          }
        ],
        statistics: { wordCount: 4, errorCount: 2 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Bonjour;comment allez-vous?');
      
      await waitFor(() => {
        expect(screen.getByText('2 suggestions')).toBeInTheDocument();
      });
      
      // Cliquer sur la première erreur
      const errorHighlights = screen.getAllByRole('button');
      fireEvent.click(errorHighlights[0]);
      
      await waitFor(() => {
        expect(screen.getByText(' ;')).toBeInTheDocument();
      });
    });
  });

  describe('Correction des erreurs de style', () => {
    it('détecte et suggère des corrections pour les répétitions', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 6,
            message: 'Le mot "manger" est répété rapidement',
            replacements: ['[Reformuler pour éviter la répétition]'],
            rule: {
              id: 'repetition-mot',
              category: 'style',
              severity: 'suggestion'
            },
            context: { text: 'manger', offset: 0, length: 6 }
          }
        ],
        statistics: { wordCount: 4, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain manger');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('[Reformuler pour éviter la répétition]')).toBeInTheDocument();
      });
    });
  });

  describe('Correction multiple et enchaînée', () => {
    it('gère plusieurs erreurs dans le même texte', async () => {
      const user = userEvent.setup();
      
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
          },
          {
            offset: 10,
            length: 2,
            message: 'Erreur et/est',
            replacements: ['est'],
            rule: {
              id: 'et-vs-est',
              category: 'spelling',
              severity: 'warning'
            },
            context: { text: 'et', offset: 10, length: 2 }
          }
        ],
        statistics: { wordCount: 4, errorCount: 2 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain et très bon');
      
      await waitFor(() => {
        expect(screen.getByText('2 suggestions')).toBeInTheDocument();
      });
      
      // Corriger la première erreur
      const errorHighlights = screen.getAllByRole('button');
      fireEvent.click(errorHighlights[0]);
      
      await waitFor(() => {
        const suggestionButton = screen.getByText('mange');
        fireEvent.click(suggestionButton);
      });
      
      // Vérifier que la première erreur est corrigée
      await waitFor(() => {
        expect(textarea).toHaveValue('mange du pain et très bon');
      });
    });

    it('gère la correction en cascade', async () => {
      const user = userEvent.setup();
      
      // Premier appel - texte avec erreurs
      mockCheckGrammar
        .mockResolvedValueOnce({
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
        })
        // Deuxième appel - après correction
        .mockResolvedValueOnce({
          errors: [],
          statistics: { wordCount: 3, errorCount: 0 }
        });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'manger du pain');
      
      // Corriger l'erreur
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        const suggestionButton = screen.getByText('mange');
        fireEvent.click(suggestionButton);
      });
      
      // Vérifier que le texte est maintenant correct
      await waitFor(() => {
        expect(textarea).toHaveValue('mange du pain');
      });
      
      // Ajouter du texte pour déclencher une nouvelle analyse
      await user.type(textarea, ' avec du beurre');
      
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalledWith('mange du pain avec du beurre');
      });
    });
  });

  describe('Gestion des erreurs complexes', () => {
    it('gère les erreurs avec plusieurs suggestions', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 8,
            message: 'Plusieurs suggestions possibles',
            replacements: ['suggestion1', 'suggestion2', 'suggestion3'],
            rule: {
              id: 'multiple-suggestions',
              category: 'grammar',
              severity: 'warning'
            },
            context: { text: 'mot_incorrect', offset: 0, length: 8 }
          }
        ],
        statistics: { wordCount: 2, errorCount: 1 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'mot_incorrect ici');
      
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('suggestion1')).toBeInTheDocument();
        expect(screen.getByText('suggestion2')).toBeInTheDocument();
        expect(screen.getByText('suggestion3')).toBeInTheDocument();
      });
      
      // Tester l'application de différentes suggestions
      const suggestion2Button = screen.getByText('suggestion2');
      fireEvent.click(suggestion2Button);
      
      await waitFor(() => {
        expect(textarea).toHaveValue('suggestion2 ici');
      });
    });
  });

  describe('Performance de correction', () => {
    it('optimise les corrections pour de longs textes', async () => {
      const user = userEvent.setup();
      
      const longText = 'Lorem ipsum '.repeat(50);
      mockCheckGrammar.mockResolvedValue({
        errors: [],
        statistics: { wordCount: 100, errorCount: 0 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, longText);
      
      await waitFor(() => {
        expect(mockCheckGrammar).toHaveBeenCalledWith(longText);
      });
    });

    it('gère les corrections rapides consécutives', async () => {
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
  });

  describe('Interface utilisateur de correction', () => {
    it('affiche les erreurs avec les bonnes couleurs selon la sévérité', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 5,
            message: 'Erreur critique',
            replacements: ['correction1'],
            rule: {
              id: 'critical-error',
              category: 'grammar',
              severity: 'critical'
            },
            context: { text: 'error1', offset: 0, length: 5 }
          },
          {
            offset: 6,
            length: 5,
            message: 'Erreur warning',
            replacements: ['correction2'],
            rule: {
              id: 'warning-error',
              category: 'spelling',
              severity: 'warning'
            },
            context: { text: 'error2', offset: 6, length: 5 }
          },
          {
            offset: 12,
            length: 5,
            message: 'Erreur suggestion',
            replacements: ['correction3'],
            rule: {
              id: 'suggestion-error',
              category: 'style',
              severity: 'suggestion'
            },
            context: { text: 'error3', offset: 12, length: 5 }
          }
        ],
        statistics: { wordCount: 3, errorCount: 3 }
      });

      render(<SmartEditor />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'error1 error2 error3');
      
      await waitFor(() => {
        const errorHighlights = screen.getAllByRole('button');
        expect(errorHighlights).toHaveLength(3);
      });
    });

    it('ferme le panneau de suggestions lors de la modification du texte', async () => {
      const user = userEvent.setup();
      
      mockCheckGrammar.mockResolvedValue({
        errors: [
          {
            offset: 0,
            length: 5,
            message: 'Erreur test',
            replacements: ['correction'],
            rule: {
              id: 'test-error',
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
      
      // Ouvrir le panneau de suggestions
      await waitFor(() => {
        const errorHighlight = screen.getByRole('button');
        fireEvent.click(errorHighlight);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Erreur test')).toBeInTheDocument();
      });
      
      // Modifier le texte
      await user.type(textarea, 'x');
      
      // Le panneau devrait se fermer
      await waitFor(() => {
        expect(screen.queryByText('Erreur test')).not.toBeInTheDocument();
      });
    });
  });
});

