// Commandes personnalisées Cypress pour FrançaisFluide

// Commande pour se connecter avec un utilisateur de test
Cypress.Commands.add('loginTestUser', () => {
  cy.window().then(win => {
    // Simuler une connexion utilisateur
    win.localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'test-user',
        name: 'Test User',
        email: 'test@francais-fluide.com',
        level: 2,
        totalPoints: 150,
      })
    );
  });
});

// Commande pour créer un document de test
Cypress.Commands.add('createTestDocument', (content: string) => {
  cy.get('[data-testid="smart-editor"] textarea').type(content);
});

// Commande pour attendre la vérification grammaticale
Cypress.Commands.add('waitForGrammarCheck', () => {
  cy.get('[data-testid="performance-indicator"]').should('contain', 'Analyse...');
  cy.wait('@grammarCheck');
  cy.get('[data-testid="performance-indicator"]').should('not.contain', 'Analyse...');
});

// Commande pour vérifier le surlignage d'erreurs
Cypress.Commands.add('checkErrorHighlight', (text: string) => {
  cy.get('[data-testid="error-highlight"]').should('be.visible');
  cy.get('[data-testid="error-highlight"]').should('contain', text);
});

// Commande pour appliquer une suggestion
Cypress.Commands.add('applySuggestion', (suggestion: string) => {
  cy.get('[data-testid="suggestions-panel"]').should('be.visible');
  cy.get('[data-testid="suggestions-panel"]').contains(suggestion).click();
  cy.get('[data-testid="suggestions-panel"]').should('not.exist');
});

// Commande pour tester la navigation
Cypress.Commands.add('testNavigation', () => {
  // Navigation vers la page d'accueil
  cy.get('[data-testid="nav-home"]').click();
  cy.url().should('include', '/');

  // Navigation vers l'éditeur
  cy.get('[data-testid="nav-editor"]').click();
  cy.url().should('include', '/editor');

  // Navigation vers les exercices
  cy.get('[data-testid="nav-exercises"]').click();
  cy.url().should('include', '/exercises');

  // Navigation vers le profil
  cy.get('[data-testid="nav-profile"]').click();
  cy.url().should('include', '/profile');
});

// Commande pour tester les exercices
Cypress.Commands.add('completeExercise', (exerciseType: string) => {
  cy.get(`[data-testid="exercise-${exerciseType}"]`).click();
  cy.get('[data-testid="exercise-content"]').should('be.visible');

  // Compléter l'exercice
  cy.get('[data-testid="exercise-answer"]').type('Réponse de test');
  cy.get('[data-testid="submit-exercise"]').click();

  // Vérifier le feedback
  cy.get('[data-testid="exercise-feedback"]').should('be.visible');
});

// Commande pour tester la gamification
Cypress.Commands.add('checkGamification', () => {
  // Vérifier l'affichage des points
  cy.get('[data-testid="total-points"]').should('be.visible');

  // Vérifier l'affichage du niveau
  cy.get('[data-testid="current-level"]').should('be.visible');

  // Vérifier l'affichage du streak
  cy.get('[data-testid="streak-days"]').should('be.visible');

  // Vérifier l'affichage des achievements
  cy.get('[data-testid="achievements"]').should('be.visible');
});

// Commande pour tester la synchronisation offline
Cypress.Commands.add('testOfflineSync', () => {
  // Simuler le mode hors ligne
  cy.window().then(win => {
    Object.defineProperty(win.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Déclencher l'événement offline
    win.dispatchEvent(new Event('offline'));
  });

  // Vérifier l'indicateur hors ligne
  cy.get('[data-testid="sync-indicator"]').should('contain', 'Hors ligne');

  // Écrire du contenu hors ligne
  cy.get('[data-testid="smart-editor"] textarea').type('Contenu hors ligne');

  // Simuler le retour en ligne
  cy.window().then(win => {
    Object.defineProperty(win.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Déclencher l'événement online
    win.dispatchEvent(new Event('online'));
  });

  // Vérifier la synchronisation
  cy.get('[data-testid="sync-indicator"]').should('contain', 'En ligne');
});

// Commande pour tester l'accessibilité
Cypress.Commands.add('testAccessibility', () => {
  // Navigation au clavier
  cy.get('body').tab();

  // Vérifier les attributs ARIA
  cy.get('[data-testid="smart-editor"] textarea').should('have.attr', 'aria-label');

  // Vérifier les rôles ARIA
  cy.get('[data-testid="suggestions-panel"]').should('have.attr', 'role', 'dialog');

  // Vérifier les contrastes de couleurs (basique)
  cy.get('[data-testid="error-highlight"]').should('be.visible');
});

// Commande pour tester les performances
Cypress.Commands.add('testPerformance', () => {
  // Mesurer le temps de chargement
  cy.window().then(win => {
    const startTime = win.performance.now();

    cy.visit('/').then(() => {
      const loadTime = win.performance.now() - startTime;
      expect(loadTime).to.be.lessThan(3000); // Moins de 3 secondes
    });
  });

  // Mesurer le temps de réponse de l'API
  cy.intercept('POST', '/api/grammar').as('grammarAPI');

  cy.get('[data-testid="smart-editor"] textarea').type('Test performance');

  cy.wait('@grammarAPI').then(interception => {
    expect(interception.response?.duration).to.be.lessThan(1000); // Moins de 1 seconde
  });
});
