// Configuration globale des tests E2E Cypress

// Import des commandes personnalisées
import './commands';

// Configuration des hooks globaux
beforeEach(() => {
  // Nettoyer les données de test avant chaque test
  cy.clearLocalStorage();
  cy.clearCookies();

  // Intercepter les appels API pour les tests
  cy.intercept('POST', '/api/grammar', { fixture: 'grammar-response.json' }).as('grammarCheck');
  cy.intercept('GET', '/api/progress', { fixture: 'progress-response.json' }).as('getProgress');
  cy.intercept('POST', '/api/progress', { fixture: 'progress-save.json' }).as('saveProgress');
});

// Configuration des timeouts
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);

// Gestion des erreurs non capturées
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ne pas faire échouer les tests sur des erreurs React non critiques
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Configuration des viewports pour les tests responsives
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 720, name: 'desktop' },
];

viewports.forEach(({ width, height, name }) => {
  Cypress.Commands.add(`viewport${name.charAt(0).toUpperCase() + name.slice(1)}`, () => {
    cy.viewport(width, height);
  });
});

// Déclaration des types TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      viewportMobile(): Chainable<void>;
      viewportTablet(): Chainable<void>;
      viewportDesktop(): Chainable<void>;
      loginTestUser(): Chainable<void>;
      createTestDocument(content: string): Chainable<void>;
      waitForGrammarCheck(): Chainable<void>;
      checkErrorHighlight(text: string): Chainable<void>;
      applySuggestion(suggestion: string): Chainable<void>;
    }
  }
}
