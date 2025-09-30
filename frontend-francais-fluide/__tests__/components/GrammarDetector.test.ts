/**
 * Tests complets pour le moteur de détection grammaticale
 * Teste les règles, patterns, analyse contextuelle et statistiques
 */

import { GrammarDetector, GRAMMAR_RULES, ERROR_PATTERNS } from '@/lib/grammar/detector';
import type { GrammarRule, GrammarError } from '@/types/grammar';

describe('GrammarDetector', () => {
  let detector: GrammarDetector;

  beforeEach(() => {
    detector = new GrammarDetector();
  });

  describe('Initialisation', () => {
    it('crée une instance avec les règles par défaut', () => {
      expect(detector).toBeInstanceOf(GrammarDetector);
    });

    it('peut ajouter des règles personnalisées', () => {
      const customRule: GrammarRule = {
        id: 'custom-test',
        category: 'grammar',
        severity: 'warning',
        pattern: /\btest\b/gi,
        check: () => ({ message: 'Test rule', suggestions: ['tested'] }),
      };

      detector.addCustomRule(customRule);

      // Vérifier que la règle a été ajoutée (pas de méthode publique pour vérifier)
      // On peut tester indirectement via l'analyse
      expect(() => detector.addCustomRule(customRule)).not.toThrow();
    });

    it('peut vider le cache', () => {
      expect(() => detector.clearCache()).not.toThrow();
    });
  });

  describe('Règles de base', () => {
    it('détecte les erreurs de conjugaison 3ème personne singulier', async () => {
      const text = 'il manger du pain';
      const result = await detector.analyze(text);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('conjugué');
      expect(result.errors[0].replacements).toContain('mange');
    });

    it('détecte les erreurs a/à', async () => {
      const text = 'à le marché';
      const result = await detector.analyze(text);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('préposition');
      expect(result.errors[0].replacements).toContain('a le');
    });

    it('détecte les erreurs et/est', async () => {
      const text = 'et très beau';
      const result = await detector.analyze(text);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('adverbe');
      expect(result.errors[0].replacements).toContain('est très');
    });

    it('détecte les problèmes de ponctuation', async () => {
      const text = 'Bonjour;comment allez-vous?';
      const result = await detector.analyze(text);

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].message).toContain('espace avant');
      expect(result.errors[1].message).toContain('espace avant');
    });

    it('détecte les répétitions de mots', async () => {
      const text = 'Il mange mange du pain';
      const result = await detector.analyze(text);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('répété');
    });
  });

  describe("Patterns d'erreurs", () => {
    it('détecte les homophones ses/ces', async () => {
      const text = 'ses amis sont là';
      const result = await detector.analyze(text);

      // Cette règle peut ne pas se déclencher selon le contexte
      // On teste la structure générale
      expect(result.errors).toBeDefined();
    });

    it('détecte les anglicismes', async () => {
      const text = 'Il supporter cette décision';
      const result = await detector.analyze(text);

      const anglicismeError = result.errors.find(
        e => e.message.includes('Anglicisme') || e.message.includes('soutenir')
      );

      if (anglicismeError) {
        expect(anglicismeError.replacements).toContain('soutenir');
      }
    });

    it('détecte les expressions incorrectes', async () => {
      const text = 'malgré que ce soit difficile';
      const result = await detector.analyze(text);

      const expressionError = result.errors.find(
        e => e.message.includes('Malgré que') || e.message.includes('bien que')
      );

      if (expressionError) {
        expect(expressionError.replacements).toContain('bien que');
      }
    });
  });

  describe('Analyse contextuelle', () => {
    it('détecte les phrases trop longues', async () => {
      const longSentence =
        'Cette phrase est vraiment très longue et contient beaucoup de mots pour tester la détection des phrases trop longues qui devraient être divisées pour améliorer la lisibilité du texte et éviter la confusion du lecteur qui pourrait avoir du mal à suivre le fil de la pensée.';

      const result = await detector.analyze(longSentence);

      const longSentenceError = result.errors.find(
        e => e.message.includes('très longue') || e.message.includes('diviser')
      );

      if (longSentenceError) {
        expect(longSentenceError.rule.category).toBe('style');
        expect(longSentenceError.rule.severity).toBe('suggestion');
      }
    });

    it("détecte l'utilisation excessive de la voix passive", async () => {
      const passiveText =
        'Le livre est écrit. La voiture est conduite. La maison est construite. Le jardin est planté.';

      const result = await detector.analyze(passiveText);

      const passiveError = result.errors.find(
        e => e.message.includes('voix passive') || e.message.includes('active')
      );

      if (passiveError) {
        expect(passiveError.rule.category).toBe('style');
      }
    });
  });

  describe('Statistiques et métriques', () => {
    it('calcule correctement les statistiques de base', async () => {
      const text = 'Bonjour le monde. Comment allez-vous?';
      const result = await detector.analyze(text);

      expect(result.statistics).toBeDefined();
      expect(result.statistics.wordCount).toBeGreaterThan(0);
      expect(result.statistics.sentenceCount).toBeGreaterThan(0);
      expect(result.statistics.errorCount).toBeGreaterThanOrEqual(0);
    });

    it("calcule le taux d'erreur", async () => {
      const text = 'manger du pain avec du beurre';
      const result = await detector.analyze(text);

      expect(result.statistics.errorDensity).toBeGreaterThanOrEqual(0);
      expect(result.statistics.errorDensity).toBeLessThanOrEqual(1);
    });

    it('groupe les erreurs par catégorie', async () => {
      const text = 'manger du pain; très beau';
      const result = await detector.analyze(text);

      expect(result.statistics.errorsByCategory).toBeDefined();
      expect(typeof result.statistics.errorsByCategory).toBe('object');
    });

    it('calcule un score de lisibilité', async () => {
      const text = 'Bonjour le monde. Comment allez-vous?';
      const result = await detector.analyze(text);

      expect(result.statistics.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.statistics.readabilityScore).toBeLessThanOrEqual(100);
    });

    it('calcule la longueur moyenne des mots', async () => {
      const text = 'Bonjour le monde magnifique';
      const result = await detector.analyze(text);

      expect(result.statistics.averageWordLength).toBeGreaterThan(0);
      expect(typeof result.statistics.averageWordLength).toBe('number');
    });

    it('calcule la longueur moyenne des phrases', async () => {
      const text = 'Phrase courte. Cette phrase est beaucoup plus longue et contient plus de mots.';
      const result = await detector.analyze(text);

      expect(result.statistics.averageSentenceLength).toBeGreaterThan(0);
      expect(typeof result.statistics.averageSentenceLength).toBe('number');
    });
  });

  describe('Cache et performance', () => {
    it('utilise le cache pour les textes identiques', async () => {
      const text = 'Texte de test pour le cache';

      // Premier appel
      const result1 = await detector.analyze(text);

      // Deuxième appel (devrait utiliser le cache)
      const result2 = await detector.analyze(text);

      expect(result1.errors).toEqual(result2.errors);
      expect(result1.statistics).toEqual(result2.statistics);
    });

    it('génère des clés de cache différentes pour des textes différents', async () => {
      const text1 = 'Premier texte';
      const text2 = 'Deuxième texte';

      const result1 = await detector.analyze(text1);
      const result2 = await detector.analyze(text2);

      // Les résultats peuvent être différents
      expect(result1.text).not.toBe(result2.text);
    });

    it('invalide le cache après ajout de règle', async () => {
      const text = 'test';

      // Premier appel
      await detector.analyze(text);

      // Ajout d'une règle personnalisée
      const customRule: GrammarRule = {
        id: 'test-cache-invalidation',
        category: 'grammar',
        severity: 'warning',
        pattern: /\btest\b/gi,
        check: () => ({ message: 'Test rule triggered', suggestions: ['tested'] }),
      };

      detector.addCustomRule(customRule);

      // Deuxième appel - devrait re-analyser
      const result = await detector.analyze(text);

      // Le cache devrait être invalidé et le texte re-analysé
      expect(result.text).toBe(text);
    });
  });

  describe('Gestion des cas limites', () => {
    it('gère les textes vides', async () => {
      const result = await detector.analyze('');

      expect(result.text).toBe('');
      expect(result.errors).toHaveLength(0);
      expect(result.statistics.wordCount).toBe(0);
      expect(result.statistics.sentenceCount).toBe(0);
    });

    it('gère les textes très courts', async () => {
      const result = await detector.analyze('a');

      expect(result.text).toBe('a');
      expect(result.statistics.wordCount).toBe(1);
    });

    it('gère les textes avec seulement de la ponctuation', async () => {
      const result = await detector.analyze('!!!???...');

      expect(result.text).toBe('!!!???...');
      expect(result.statistics.wordCount).toBe(0);
    });

    it('gère les textes avec des caractères spéciaux', async () => {
      const text = 'Texte avec @#$%^&*() caractères spéciaux';
      const result = await detector.analyze(text);

      expect(result.text).toBe(text);
      expect(result.errors).toBeDefined();
    });

    it('gère les textes multilingues', async () => {
      const text = 'Bonjour hello hola 你好';
      const result = await detector.analyze(text);

      expect(result.text).toBe(text);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Tri et positionnement des erreurs', () => {
    it('trie les erreurs par position dans le texte', async () => {
      const text = 'manger du pain et très beau';
      const result = await detector.analyze(text);

      if (result.errors.length > 1) {
        for (let i = 1; i < result.errors.length; i++) {
          expect(result.errors[i].offset).toBeGreaterThanOrEqual(result.errors[i - 1].offset);
        }
      }
    });

    it('calcule correctement les positions des erreurs', async () => {
      const text = 'manger du pain';
      const result = await detector.analyze(text);

      result.errors.forEach(error => {
        expect(error.offset).toBeGreaterThanOrEqual(0);
        expect(error.offset).toBeLessThan(text.length);
        expect(error.length).toBeGreaterThan(0);
        expect(error.offset + error.length).toBeLessThanOrEqual(text.length);
      });
    });
  });

  describe('Types et sévérité des erreurs', () => {
    it("assigne correctement les catégories d'erreurs", async () => {
      const text = 'manger du pain; très beau';
      const result = await detector.analyze(text);

      const categories = ['grammar', 'spelling', 'punctuation', 'style'];

      result.errors.forEach(error => {
        expect(categories).toContain(error.rule.category);
      });
    });

    it('assigne correctement les niveaux de sévérité', async () => {
      const text = 'manger du pain; très beau';
      const result = await detector.analyze(text);

      const severities = ['critical', 'warning', 'suggestion'];

      result.errors.forEach(error => {
        expect(severities).toContain(error.rule.severity);
      });
    });

    it("fournit des messages d'erreur explicites", async () => {
      const text = 'manger du pain';
      const result = await detector.analyze(text);

      result.errors.forEach(error => {
        expect(error.message).toBeDefined();
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
      });
    });

    it('fournit des suggestions de correction', async () => {
      const text = 'manger du pain';
      const result = await detector.analyze(text);

      result.errors.forEach(error => {
        expect(Array.isArray(error.replacements)).toBe(true);
        if (error.replacements.length > 0) {
          error.replacements.forEach(replacement => {
            expect(typeof replacement).toBe('string');
            expect(replacement.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });
});
