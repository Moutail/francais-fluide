/**
 * Tests E2E pour le workflow de l'éditeur
 * Teste l'écriture, la correction, les suggestions et les métriques
 */

describe('Workflow de l\'éditeur', () => {
  beforeEach(() => {
    cy.loginTestUser();
    cy.visit('/editor');
  });

  describe('Interface de l\'éditeur', () => {
    it('affiche l\'éditeur avec tous les éléments', () => {
      cy.get('[data-testid="smart-editor"]').should('be.visible');
      cy.get('[data-testid="smart-editor"] textarea').should('be.visible');
      cy.get('[data-testid="performance-indicator"]').should('be.visible');
      cy.get('[data-testid="status-bar"]').should('be.visible');
    });

    it('affiche le placeholder approprié', () => {
      cy.get('[data-testid="smart-editor"] textarea')
        .should('have.attr', 'placeholder')
        .and('contain', 'Commencez à écrire');
    });

    it('permet de saisir du texte', () => {
      const testText = 'Voici un texte de test pour l\'éditeur';
      
      cy.get('[data-testid="smart-editor"] textarea')
        .type(testText)
        .should('have.value', testText);
    });

    it('affiche le nombre de mots en temps réel', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('Un deux trois quatre cinq');
      
      cy.get('[data-testid="word-count"]').should('contain', '5 mots');
    });
  });

  describe('Correction grammaticale en temps réel', () => {
    it('détecte et affiche les erreurs grammaticales', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="error-highlight"]').should('be.visible');
      cy.get('[data-testid="error-count"]').should('contain', '1 suggestion');
    });

    it('affiche les suggestions lors du clic sur une erreur', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="error-highlight"]').click();
      
      cy.get('[data-testid="suggestions-panel"]').should('be.visible');
      cy.get('[data-testid="suggestions-panel"]').should('contain', 'mange');
    });

    it('permet d\'appliquer une suggestion', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="error-highlight"]').click();
      cy.applySuggestion('mange');
      
      cy.get('[data-testid="smart-editor"] textarea')
        .should('have.value', 'il mange du pain');
    });

    it('gère plusieurs erreurs dans le même texte', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain et très bon');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="error-highlight"]').should('have.length.at.least', 2);
      cy.get('[data-testid="error-count"]').should('contain', '2 suggestions');
    });

    it('ferme le panneau de suggestions lors de la modification du texte', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="error-highlight"]').click();
      cy.get('[data-testid="suggestions-panel"]').should('be.visible');
      
      // Modifier le texte
      cy.get('[data-testid="smart-editor"] textarea').type('x');
      
      cy.get('[data-testid="suggestions-panel"]').should('not.exist');
    });
  });

  describe('Métriques et performance', () => {
    it('affiche le taux de précision', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('Texte parfait sans erreurs');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="accuracy-rate"]').should('be.visible');
      cy.get('[data-testid="accuracy-rate"]').should('contain', '% précision');
    });

    it('affiche le streak de perfection', () => {
      // Écrire plusieurs phrases parfaites
      cy.get('[data-testid="smart-editor"] textarea').type('Première phrase parfaite.');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="smart-editor"] textarea').clear().type('Deuxième phrase parfaite.');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="perfect-streak"]').should('be.visible');
    });

    it('met à jour les métriques en temps réel', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('Texte de test');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="word-count"]').should('contain', '2 mots');
      cy.get('[data-testid="accuracy-rate"]').should('be.visible');
    });
  });

  describe('Modes de fonctionnement', () => {
    it('permet de changer le mode d\'écriture', () => {
      cy.get('[data-testid="mode-selector"]').click();
      cy.get('[data-testid="mode-exam"]').click();
      
      cy.get('[data-testid="current-mode"]').should('contain', 'Examen');
    });

    it('adapte l\'interface selon le mode', () => {
      // Mode examen
      cy.get('[data-testid="mode-selector"]').click();
      cy.get('[data-testid="mode-exam"]').click();
      
      cy.get('[data-testid="exam-timer"]').should('be.visible');
      cy.get('[data-testid="exam-progress"]').should('be.visible');
      
      // Mode créatif
      cy.get('[data-testid="mode-selector"]').click();
      cy.get('[data-testid="mode-creative"]').click();
      
      cy.get('[data-testid="creative-tools"]').should('be.visible');
    });

    it('désactive la correction en temps réel en mode examen', () => {
      cy.get('[data-testid="mode-selector"]').click();
      cy.get('[data-testid="mode-exam"]').click();
      
      cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain');
      
      // Attendre un peu pour s'assurer que la correction ne se déclenche pas
      cy.wait(1000);
      
      cy.get('[data-testid="error-highlight"]').should('not.exist');
    });
  });

  describe('Sauvegarde automatique', () => {
    it('sauvegarde automatiquement le contenu', () => {
      const testContent = 'Contenu à sauvegarder automatiquement';
      
      cy.get('[data-testid="smart-editor"] textarea').type(testContent);
      
      // Attendre la sauvegarde automatique
      cy.get('[data-testid="save-indicator"]').should('contain', 'Sauvegardé');
    });

    it('indique l\'état de sauvegarde', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('Test sauvegarde');
      
      cy.get('[data-testid="save-indicator"]').should('contain', 'Sauvegarde');
      
      // Attendre que la sauvegarde soit terminée
      cy.get('[data-testid="save-indicator"]').should('contain', 'Sauvegardé');
    });

    it('gère les erreurs de sauvegarde', () => {
      // Simuler une erreur de sauvegarde
      cy.intercept('POST', '/api/autosave', { statusCode: 500 }).as('saveError');
      
      cy.get('[data-testid="smart-editor"] textarea').type('Test erreur');
      
      cy.wait('@saveError');
      cy.get('[data-testid="save-error"]').should('contain', 'Erreur de sauvegarde');
    });
  });

  describe('Collaboration en temps réel', () => {
    it('affiche l\'indicateur de connexion', () => {
      cy.get('[data-testid="collaboration-status"]').should('be.visible');
      cy.get('[data-testid="collaboration-status"]').should('contain', 'En ligne');
    });

    it('permet la collaboration avec d\'autres utilisateurs', () => {
      // Simuler la présence d'autres utilisateurs
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('user-joined', {
          detail: { userId: 'user-2', name: 'Collaborateur' }
        }));
      });
      
      cy.get('[data-testid="collaborator-list"]').should('contain', 'Collaborateur');
    });

    it('synchronise les changements en temps réel', () => {
      // Simuler un changement d'un autre utilisateur
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('text-changed', {
          detail: { content: 'Contenu modifié par un autre utilisateur' }
        }));
      });
      
      cy.get('[data-testid="smart-editor"] textarea')
        .should('have.value', 'Contenu modifié par un autre utilisateur');
    });
  });

  describe('Outils et fonctionnalités avancées', () => {
    it('permet d\'utiliser la barre d\'outils', () => {
      cy.get('[data-testid="editor-toolbar"]').should('be.visible');
      
      // Test du bouton de formatage
      cy.get('[data-testid="toolbar-bold"]').click();
      cy.get('[data-testid="smart-editor"] textarea').type('Texte en gras');
      
      // Le formatage devrait être appliqué
      cy.get('[data-testid="smart-editor"] textarea').should('have.value', '**Texte en gras**');
    });

    it('permet d\'utiliser les raccourcis clavier', () => {
      cy.get('[data-testid="smart-editor"] textarea')
        .type('Texte sélectionné')
        .selectText()
        .type('{ctrl}b'); // Ctrl+B pour gras
      
      cy.get('[data-testid="smart-editor"] textarea')
        .should('have.value', '**Texte sélectionné**');
    });

    it('permet d\'annuler et rétablir', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('Premier texte');
      
      cy.get('[data-testid="toolbar-undo"]').click();
      cy.get('[data-testid="smart-editor"] textarea').should('have.value', '');
      
      cy.get('[data-testid="toolbar-redo"]').click();
      cy.get('[data-testid="smart-editor"] textarea').should('have.value', 'Premier texte');
    });

    it('permet de rechercher et remplacer', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('Texte avec mot à remplacer');
      
      cy.get('[data-testid="toolbar-search"]').click();
      
      cy.get('[data-testid="search-input"]').type('mot');
      cy.get('[data-testid="replace-input"]').type('terme');
      cy.get('[data-testid="replace-all"]').click();
      
      cy.get('[data-testid="smart-editor"] textarea')
        .should('have.value', 'Texte avec terme à remplacer');
    });
  });

  describe('Accessibilité et UX', () => {
    it('fonctionne avec la navigation au clavier', () => {
      cy.get('[data-testid="smart-editor"] textarea').focus();
      
      cy.focused().type('Navigation au clavier');
      cy.focused().should('have.value', 'Navigation au clavier');
    });

    it('a des attributs ARIA appropriés', () => {
      cy.get('[data-testid="smart-editor"] textarea')
        .should('have.attr', 'aria-label')
        .and('contain', 'Éditeur');
      
      cy.get('[data-testid="suggestions-panel"]')
        .should('have.attr', 'role', 'dialog');
    });

    it('affiche des messages d\'erreur accessibles', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain');
      
      cy.waitForGrammarCheck();
      
      cy.get('[data-testid="error-highlight"]').click();
      
      cy.get('[data-testid="suggestions-panel"]')
        .should('have.attr', 'aria-live', 'polite');
    });

    it('gère les contrastes de couleurs', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('Test contraste');
      
      // Vérifier que les erreurs sont visibles
      cy.get('[data-testid="error-highlight"]').should('be.visible');
      
      // Vérifier que le texte est lisible
      cy.get('[data-testid="smart-editor"] textarea')
        .should('have.css', 'color')
        .and('not.equal', 'transparent');
    });
  });

  describe('Performance et optimisation', () => {
    it('gère les textes longs efficacement', () => {
      const longText = 'Lorem ipsum '.repeat(100);
      
      cy.get('[data-testid="smart-editor"] textarea').type(longText);
      
      // L'éditeur devrait rester responsive
      cy.get('[data-testid="smart-editor"] textarea').should('be.visible');
      cy.get('[data-testid="word-count"]').should('contain', '200 mots');
    });

    it('optimise les appels API avec debounce', () => {
      cy.get('[data-testid="smart-editor"] textarea').type('a');
      cy.get('[data-testid="smart-editor"] textarea').type('b');
      cy.get('[data-testid="smart-editor"] textarea').type('c');
      
      // Attendre que le debounce se déclenche
      cy.waitForGrammarCheck();
      
      // Vérifier qu'un seul appel API a été fait
      cy.get('@grammarCheck.all').should('have.length', 1);
    });

    it('met en cache les résultats d\'analyse', () => {
      const testText = 'Texte à analyser';
      
      cy.get('[data-testid="smart-editor"] textarea').type(testText);
      cy.waitForGrammarCheck();
      
      // Effacer et retaper le même texte
      cy.get('[data-testid="smart-editor"] textarea').clear().type(testText);
      
      // L'analyse devrait être plus rapide grâce au cache
      cy.get('[data-testid="performance-indicator"]').should('not.contain', 'Analyse...');
    });
  });

  describe('Gestion des erreurs', () => {
    it('gère les erreurs de l\'API de correction', () => {
      cy.intercept('POST', '/api/grammar', { forceNetworkError: true }).as('grammarError');
      
      cy.get('[data-testid="smart-editor"] textarea').type('Test erreur API');
      
      cy.wait('@grammarError');
      cy.get('[data-testid="error-message"]').should('contain', 'Erreur de connexion');
    });

    it('gère les timeouts de l\'API', () => {
      cy.intercept('POST', '/api/grammar', { delay: 15000 }).as('grammarTimeout');
      
      cy.get('[data-testid="smart-editor"] textarea').type('Test timeout');
      
      cy.get('[data-testid="timeout-message"]').should('contain', 'Timeout');
    });

    it('récupère après une erreur', () => {
      // Première tentative avec erreur
      cy.intercept('POST', '/api/grammar', { statusCode: 500 }).as('grammarError');
      
      cy.get('[data-testid="smart-editor"] textarea').type('Test récupération');
      
      cy.wait('@grammarError');
      
      // Deuxième tentative qui réussit
      cy.intercept('POST', '/api/grammar', { fixture: 'grammar-response.json' }).as('grammarSuccess');
      
      cy.get('[data-testid="smart-editor"] textarea').type('x');
      
      cy.wait('@grammarSuccess');
      cy.get('[data-testid="error-message"]').should('not.exist');
    });
  });
});
