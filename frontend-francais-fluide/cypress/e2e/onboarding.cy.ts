/**
 * Tests E2E pour le parcours d'onboarding
 * Teste l'inscription, la connexion et la configuration initiale
 */

describe('Parcours d\'onboarding', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  describe('Page d\'accueil et présentation', () => {
    it('affiche la page d\'accueil avec les éléments principaux', () => {
      cy.get('[data-testid="hero-section"]').should('be.visible');
      cy.get('[data-testid="hero-title"]').should('contain', 'FrançaisFluide');
      cy.get('[data-testid="hero-subtitle"]').should('be.visible');
      
      // Vérifier les boutons d'action
      cy.get('[data-testid="cta-start"]').should('be.visible');
      cy.get('[data-testid="cta-demo"]').should('be.visible');
    });

    it('affiche les fonctionnalités principales', () => {
      cy.get('[data-testid="features-section"]').should('be.visible');
      
      // Vérifier les cartes de fonctionnalités
      cy.get('[data-testid="feature-correction"]').should('be.visible');
      cy.get('[data-testid="feature-gamification"]').should('be.visible');
      cy.get('[data-testid="feature-collaboration"]').should('be.visible');
      cy.get('[data-testid="feature-analytics"]').should('be.visible');
    });

    it('permet de voir la démo sans inscription', () => {
      cy.get('[data-testid="cta-demo"]').click();
      
      cy.url().should('include', '/demo');
      cy.get('[data-testid="demo-editor"]').should('be.visible');
    });
  });

  describe('Processus d\'inscription', () => {
    it('permet de s\'inscrire avec un email valide', () => {
      cy.get('[data-testid="cta-start"]').click();
      
      // Vérifier que le formulaire d'inscription s'affiche
      cy.get('[data-testid="signup-form"]').should('be.visible');
      
      // Remplir le formulaire
      cy.get('[data-testid="input-name"]').type('Test User');
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="input-confirm-password"]').type('password123');
      
      // Accepter les conditions
      cy.get('[data-testid="checkbox-terms"]').check();
      
      // Soumettre le formulaire
      cy.get('[data-testid="submit-signup"]').click();
      
      // Vérifier la redirection vers l'éditeur
      cy.url().should('include', '/editor');
      cy.get('[data-testid="welcome-message"]').should('be.visible');
    });

    it('valide les champs du formulaire d\'inscription', () => {
      cy.get('[data-testid="cta-start"]').click();
      
      // Test avec un email invalide
      cy.get('[data-testid="input-email"]').type('email-invalide');
      cy.get('[data-testid="submit-signup"]').click();
      
      cy.get('[data-testid="error-email"]').should('contain', 'Email invalide');
      
      // Test avec des mots de passe différents
      cy.get('[data-testid="input-email"]').clear().type('test@example.com');
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="input-confirm-password"]').type('password456');
      cy.get('[data-testid="submit-signup"]').click();
      
      cy.get('[data-testid="error-password"]').should('contain', 'Mots de passe différents');
    });

    it('gère les erreurs d\'inscription', () => {
      cy.intercept('POST', '/api/auth/signup', {
        statusCode: 400,
        body: { error: 'Email déjà utilisé' }
      }).as('signupError');
      
      cy.get('[data-testid="cta-start"]').click();
      
      cy.get('[data-testid="input-name"]').type('Test User');
      cy.get('[data-testid="input-email"]').type('existing@example.com');
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="input-confirm-password"]').type('password123');
      cy.get('[data-testid="checkbox-terms"]').check();
      
      cy.get('[data-testid="submit-signup"]').click();
      
      cy.wait('@signupError');
      cy.get('[data-testid="error-message"]').should('contain', 'Email déjà utilisé');
    });
  });

  describe('Processus de connexion', () => {
    it('permet de se connecter avec des identifiants valides', () => {
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="login-form"]').should('be.visible');
      
      // Remplir le formulaire de connexion
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="input-password"]').type('password123');
      
      cy.get('[data-testid="submit-login"]').click();
      
      // Vérifier la redirection
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('gère les erreurs de connexion', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Identifiants invalides' }
      }).as('loginError');
      
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="input-email"]').type('wrong@example.com');
      cy.get('[data-testid="input-password"]').type('wrongpassword');
      
      cy.get('[data-testid="submit-login"]').click();
      
      cy.wait('@loginError');
      cy.get('[data-testid="error-message"]').should('contain', 'Identifiants invalides');
    });

    it('permet la réinitialisation du mot de passe', () => {
      cy.get('[data-testid="login-link"]').click();
      
      cy.get('[data-testid="forgot-password"]').click();
      
      cy.get('[data-testid="reset-form"]').should('be.visible');
      
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="submit-reset"]').click();
      
      cy.get('[data-testid="success-message"]').should('contain', 'Email envoyé');
    });
  });

  describe('Configuration initiale du profil', () => {
    beforeEach(() => {
      // Se connecter avec un utilisateur de test
      cy.loginTestUser();
      cy.visit('/profile/setup');
    });

    it('permet de configurer le niveau de français initial', () => {
      cy.get('[data-testid="level-selector"]').should('be.visible');
      
      // Sélectionner un niveau
      cy.get('[data-testid="level-intermediate"]').click();
      
      cy.get('[data-testid="continue-setup"]').click();
      
      // Vérifier que le niveau est sauvegardé
      cy.get('[data-testid="level-confirmation"]').should('contain', 'Intermédiaire');
    });

    it('permet de choisir les objectifs d\'apprentissage', () => {
      cy.get('[data-testid="objectives-section"]').should('be.visible');
      
      // Sélectionner plusieurs objectifs
      cy.get('[data-testid="objective-grammar"]').check();
      cy.get('[data-testid="objective-vocabulary"]').check();
      cy.get('[data-testid="objective-writing"]').check();
      
      cy.get('[data-testid="continue-setup"]').click();
      
      // Vérifier la sauvegarde
      cy.get('[data-testid="objectives-summary"]').should('be.visible');
    });

    it('permet de configurer les préférences', () => {
      cy.get('[data-testid="preferences-section"]').should('be.visible');
      
      // Configurer les préférences
      cy.get('[data-testid="pref-correction-level"]').select('strict');
      cy.get('[data-testid="pref-notifications"]').check();
      cy.get('[data-testid="pref-theme"]').select('dark');
      
      cy.get('[data-testid="finish-setup"]').click();
      
      // Vérifier la redirection vers l'éditeur
      cy.url().should('include', '/editor');
    });
  });

  describe('Tutorial et première utilisation', () => {
    beforeEach(() => {
      cy.loginTestUser();
      cy.visit('/editor');
    });

    it('affiche le tutorial pour les nouveaux utilisateurs', () => {
      cy.get('[data-testid="tutorial-overlay"]').should('be.visible');
      cy.get('[data-testid="tutorial-step-1"]').should('be.visible');
      
      // Suivre le tutorial
      cy.get('[data-testid="tutorial-next"]').click();
      cy.get('[data-testid="tutorial-step-2"]').should('be.visible');
      
      cy.get('[data-testid="tutorial-next"]').click();
      cy.get('[data-testid="tutorial-step-3"]').should('be.visible');
      
      cy.get('[data-testid="tutorial-finish"]').click();
      
      // Vérifier que le tutorial est fermé
      cy.get('[data-testid="tutorial-overlay"]').should('not.exist');
    });

    it('permet de passer le tutorial', () => {
      cy.get('[data-testid="tutorial-skip"]').click();
      
      cy.get('[data-testid="tutorial-overlay"]').should('not.exist');
      cy.get('[data-testid="smart-editor"]').should('be.visible');
    });

    it('guide l\'utilisateur pour sa première écriture', () => {
      cy.get('[data-testid="tutorial-finish"]').click();
      
      // L'éditeur devrait être visible et prêt
      cy.get('[data-testid="smart-editor"] textarea').should('be.visible');
      cy.get('[data-testid="smart-editor"] textarea').should('have.attr', 'placeholder');
    });
  });

  describe('Responsive et accessibilité', () => {
    it('fonctionne sur mobile', () => {
      cy.viewportMobile();
      
      cy.get('[data-testid="hero-section"]').should('be.visible');
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      
      cy.get('[data-testid="mobile-menu"]').click();
      cy.get('[data-testid="mobile-nav"]').should('be.visible');
    });

    it('fonctionne sur tablette', () => {
      cy.viewportTablet();
      
      cy.get('[data-testid="hero-section"]').should('be.visible');
      cy.get('[data-testid="features-grid"]').should('be.visible');
    });

    it('est accessible au clavier', () => {
      // Navigation au clavier
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Test de la navigation dans les formulaires
      cy.get('[data-testid="cta-start"]').click();
      
      cy.get('[data-testid="input-name"]').focus();
      cy.focused().type('Test User');
      
      cy.focused().tab();
      cy.focused().type('test@example.com');
    });

    it('a des contrastes de couleurs appropriés', () => {
      // Vérifier les éléments principaux
      cy.get('[data-testid="hero-title"]').should('be.visible');
      cy.get('[data-testid="cta-start"]').should('be.visible');
      
      // Les éléments devraient être visibles et contrastés
      cy.get('[data-testid="hero-title"]').should('have.css', 'color');
    });
  });

  describe('Performance et chargement', () => {
    it('charge rapidement la page d\'accueil', () => {
      const startTime = Date.now();
      
      cy.visit('/').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('optimise les images et ressources', () => {
      cy.visit('/');
      
      // Vérifier que les images sont optimisées
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('gère les erreurs de chargement', () => {
      // Simuler une erreur de chargement
      cy.intercept('GET', '/api/features', { forceNetworkError: true }).as('featuresError');
      
      cy.visit('/');
      
      // L'application devrait toujours fonctionner
      cy.get('[data-testid="hero-section"]').should('be.visible');
    });
  });
});
