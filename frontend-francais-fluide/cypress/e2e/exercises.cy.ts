/**
 * Tests E2E pour les exercices
 * Teste la sélection, l'exécution et la correction des exercices
 */

describe('Exercices', () => {
  beforeEach(() => {
    cy.loginTestUser();
    cy.visit('/exercises');
  });

  describe('Sélection d\'exercices', () => {
    it('affiche la liste des exercices disponibles', () => {
      cy.get('[data-testid="exercises-list"]').should('be.visible');
      
      // Vérifier les catégories d'exercices
      cy.get('[data-testid="exercise-category-grammar"]').should('be.visible');
      cy.get('[data-testid="exercise-category-vocabulary"]').should('be.visible');
      cy.get('[data-testid="exercise-category-conjugation"]').should('be.visible');
      cy.get('[data-testid="exercise-category-spelling"]').should('be.visible');
    });

    it('permet de filtrer les exercices par catégorie', () => {
      cy.get('[data-testid="filter-grammar"]').click();
      
      cy.get('[data-testid="exercises-list"]')
        .find('[data-testid^="exercise-item"]')
        .should('have.length.at.least', 1);
      
      cy.get('[data-testid="filter-vocabulary"]').click();
      
      cy.get('[data-testid="exercises-list"]')
        .find('[data-testid^="exercise-item"]')
        .should('have.length.at.least', 1);
    });

    it('permet de filtrer par niveau de difficulté', () => {
      cy.get('[data-testid="difficulty-filter"]').select('Débutant');
      
      cy.get('[data-testid="exercises-list"]')
        .find('[data-testid="exercise-difficulty"]')
        .each(($el) => {
          cy.wrap($el).should('contain', 'Débutant');
        });
    });

    it('permet de rechercher des exercices', () => {
      cy.get('[data-testid="search-exercises"]').type('conjugaison');
      
      cy.get('[data-testid="exercises-list"]')
        .find('[data-testid^="exercise-item"]')
        .should('have.length.at.least', 1);
    });

    it('affiche les informations de chaque exercice', () => {
      cy.get('[data-testid="exercise-item-1"]').should('be.visible');
      
      cy.get('[data-testid="exercise-item-1"]')
        .find('[data-testid="exercise-title"]')
        .should('be.visible');
      
      cy.get('[data-testid="exercise-item-1"]')
        .find('[data-testid="exercise-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="exercise-item-1"]')
        .find('[data-testid="exercise-difficulty"]')
        .should('be.visible');
      
      cy.get('[data-testid="exercise-item-1"]')
        .find('[data-testid="exercise-duration"]')
        .should('be.visible');
    });
  });

  describe('Lancement d\'exercices', () => {
    it('permet de lancer un exercice', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.url().should('include', '/exercises/');
      cy.get('[data-testid="exercise-player"]').should('be.visible');
    });

    it('affiche les instructions de l\'exercice', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-instructions"]').should('be.visible');
      cy.get('[data-testid="exercise-instructions"]').should('contain', 'Instructions');
    });

    it('affiche la barre de progression', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-progress"]').should('be.visible');
      cy.get('[data-testid="exercise-progress"]').should('contain', '0 /');
    });

    it('affiche le timer si applicable', () => {
      cy.get('[data-testid="exercise-item-timed"]').click();
      
      cy.get('[data-testid="exercise-timer"]').should('be.visible');
      cy.get('[data-testid="exercise-timer"]').should('contain', '00:');
    });
  });

  describe('Exercices de grammaire', () => {
    beforeEach(() => {
      cy.get('[data-testid="exercise-item-grammar-1"]').click();
    });

    it('affiche les questions de grammaire', () => {
      cy.get('[data-testid="exercise-question"]').should('be.visible');
      cy.get('[data-testid="exercise-question"]').should('contain', 'Question');
    });

    it('permet de répondre aux questions', () => {
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse de test');
      
      cy.get('[data-testid="exercise-answer-input"]')
        .should('have.value', 'Réponse de test');
    });

    it('valide les réponses', () => {
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse correcte');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="answer-feedback"]').should('be.visible');
    });

    it('affiche les corrections', () => {
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse incorrecte');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="answer-correction"]').should('be.visible');
      cy.get('[data-testid="answer-explanation"]').should('be.visible');
    });

    it('permet de passer à la question suivante', () => {
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="next-question"]').click();
      
      cy.get('[data-testid="exercise-progress"]').should('contain', '1 /');
    });
  });

  describe('Exercices de vocabulaire', () => {
    beforeEach(() => {
      cy.get('[data-testid="exercise-item-vocabulary-1"]').click();
    });

    it('affiche les exercices de vocabulaire', () => {
      cy.get('[data-testid="vocabulary-exercise"]').should('be.visible');
    });

    it('permet de choisir parmi plusieurs options', () => {
      cy.get('[data-testid="vocabulary-options"]').should('be.visible');
      
      cy.get('[data-testid="vocabulary-option-1"]').click();
      cy.get('[data-testid="vocabulary-option-1"]').should('have.class', 'selected');
    });

    it('valide les choix de vocabulaire', () => {
      cy.get('[data-testid="vocabulary-option-1"]').click();
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="answer-feedback"]').should('be.visible');
    });

    it('affiche les définitions', () => {
      cy.get('[data-testid="vocabulary-option-1"]').click();
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="vocabulary-definition"]').should('be.visible');
    });
  });

  describe('Exercices de conjugaison', () => {
    beforeEach(() => {
      cy.get('[data-testid="exercise-item-conjugation-1"]').click();
    });

    it('affiche les exercices de conjugaison', () => {
      cy.get('[data-testid="conjugation-exercise"]').should('be.visible');
    });

    it('permet de conjuguer les verbes', () => {
      cy.get('[data-testid="conjugation-input"]').type('mange');
      
      cy.get('[data-testid="conjugation-input"]')
        .should('have.value', 'mange');
    });

    it('valide les conjugaisons', () => {
      cy.get('[data-testid="conjugation-input"]').type('mange');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="answer-feedback"]').should('be.visible');
    });

    it('affiche les règles de conjugaison', () => {
      cy.get('[data-testid="conjugation-input"]').type('mange');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="conjugation-rule"]').should('be.visible');
    });
  });

  describe('Exercices d\'orthographe', () => {
    beforeEach(() => {
      cy.get('[data-testid="exercise-item-spelling-1"]').click();
    });

    it('affiche les exercices d\'orthographe', () => {
      cy.get('[data-testid="spelling-exercise"]').should('be.visible');
    });

    it('permet de corriger l\'orthographe', () => {
      cy.get('[data-testid="spelling-input"]').type('orthographe correcte');
      
      cy.get('[data-testid="spelling-input"]')
        .should('have.value', 'orthographe correcte');
    });

    it('valide l\'orthographe', () => {
      cy.get('[data-testid="spelling-input"]').type('orthographe correcte');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="answer-feedback"]').should('be.visible');
    });

    it('affiche les règles d\'orthographe', () => {
      cy.get('[data-testid="spelling-input"]').type('orthographe correcte');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="spelling-rule"]').should('be.visible');
    });
  });

  describe('Progression et scoring', () => {
    it('affiche la progression en temps réel', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-progress"]').should('contain', '0 /');
      
      // Répondre à une question
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse');
      cy.get('[data-testid="submit-answer"]').click();
      cy.get('[data-testid="next-question"]').click();
      
      cy.get('[data-testid="exercise-progress"]').should('contain', '1 /');
    });

    it('calcule et affiche le score', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      // Répondre à plusieurs questions
      for (let i = 0; i < 3; i++) {
        cy.get('[data-testid="exercise-answer-input"]').type('Réponse');
        cy.get('[data-testid="submit-answer"]').click();
        cy.get('[data-testid="next-question"]').click();
      }
      
      cy.get('[data-testid="exercise-score"]').should('be.visible');
      cy.get('[data-testid="exercise-score"]').should('contain', '%');
    });

    it('affiche les statistiques de l\'exercice', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      // Compléter l'exercice
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse');
      cy.get('[data-testid="submit-answer"]').click();
      cy.get('[data-testid="finish-exercise"]').click();
      
      cy.get('[data-testid="exercise-stats"]').should('be.visible');
      cy.get('[data-testid="exercise-stats"]').should('contain', 'Temps');
      cy.get('[data-testid="exercise-stats"]').should('contain', 'Réponses correctes');
    });
  });

  describe('Gamification des exercices', () => {
    it('attribue des points pour les bonnes réponses', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-points"]').should('contain', '0 points');
      
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse correcte');
      cy.get('[data-testid="submit-answer"]').click();
      
      cy.get('[data-testid="exercise-points"]').should('contain', '10 points');
    });

    it('affiche les achievements débloqués', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      // Compléter l'exercice avec un score élevé
      cy.get('[data-testid="exercise-answer-input"]').type('Réponse correcte');
      cy.get('[data-testid="submit-answer"]').click();
      cy.get('[data-testid="finish-exercise"]').click();
      
      cy.get('[data-testid="achievement-unlocked"]').should('be.visible');
    });

    it('affiche les streaks', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-streak"]').should('be.visible');
      cy.get('[data-testid="exercise-streak"]').should('contain', 'Streak');
    });

    it('affiche le classement', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-leaderboard"]').should('be.visible');
      cy.get('[data-testid="exercise-leaderboard"]').should('contain', 'Classement');
    });
  });

  describe('Navigation et contrôle', () => {
    it('permet de revenir à la liste des exercices', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="back-to-exercises"]').click();
      
      cy.url().should('include', '/exercises');
      cy.get('[data-testid="exercises-list"]').should('be.visible');
    });

    it('permet de mettre en pause l\'exercice', () => {
      cy.get('[data-testid="exercise-item-timed"]').click();
      
      cy.get('[data-testid="pause-exercise"]').click();
      
      cy.get('[data-testid="exercise-paused"]').should('be.visible');
      cy.get('[data-testid="resume-exercise"]').should('be.visible');
    });

    it('permet de reprendre l\'exercice', () => {
      cy.get('[data-testid="exercise-item-timed"]').click();
      
      cy.get('[data-testid="pause-exercise"]').click();
      cy.get('[data-testid="resume-exercise"]').click();
      
      cy.get('[data-testid="exercise-paused"]').should('not.exist');
    });

    it('permet d\'abandonner l\'exercice', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="abandon-exercise"]').click();
      
      cy.get('[data-testid="abandon-confirmation"]').should('be.visible');
      cy.get('[data-testid="confirm-abandon"]').click();
      
      cy.url().should('include', '/exercises');
    });
  });

  describe('Accessibilité', () => {
    it('fonctionne avec la navigation au clavier', () => {
      cy.get('[data-testid="exercise-item-1"]').focus();
      cy.focused().type('{enter}');
      
      cy.get('[data-testid="exercise-player"]').should('be.visible');
    });

    it('a des attributs ARIA appropriés', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-question"]')
        .should('have.attr', 'aria-live', 'polite');
      
      cy.get('[data-testid="exercise-answer-input"]')
        .should('have.attr', 'aria-label');
    });

    it('gère les contrastes de couleurs', () => {
      cy.get('[data-testid="exercise-item-1"]').click();
      
      cy.get('[data-testid="exercise-question"]').should('be.visible');
      cy.get('[data-testid="exercise-answer-input"]').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('charge rapidement les exercices', () => {
      const startTime = Date.now();
      
      cy.get('[data-testid="exercise-item-1"]').click().then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(2000);
      });
    });

    it('gère les exercices avec beaucoup de questions', () => {
      cy.get('[data-testid="exercise-item-long"]').click();
      
      cy.get('[data-testid="exercise-player"]').should('be.visible');
      
      // Répondre à plusieurs questions rapidement
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="exercise-answer-input"]').type('Réponse');
        cy.get('[data-testid="submit-answer"]').click();
        cy.get('[data-testid="next-question"]').click();
      }
      
      cy.get('[data-testid="exercise-progress"]').should('contain', '10 /');
    });
  });
});
