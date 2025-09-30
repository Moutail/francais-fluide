# Guide de Tests - FrançaisFluide

Ce guide explique comment exécuter et maintenir les tests pour FrançaisFluide.

## Vue d'ensemble

FrançaisFluide utilise une stratégie de tests en pyramide avec trois niveaux :

1. **Tests unitaires** (60%) - Jest + React Testing Library
2. **Tests d'intégration** (20%) - Jest + React Testing Library
3. **Tests E2E** (20%) - Cypress

## Structure des tests

```
frontend-francais-fluide/
├── __tests__/
│   ├── components/           # Tests de composants
│   │   ├── SmartEditor.test.tsx
│   │   ├── GrammarDetector.test.ts
│   │   └── Gamification.test.tsx
│   └── integration/          # Tests d'intégration
│       ├── user-flow.test.ts
│       ├── error-correction.test.ts
│       └── offline-sync.test.ts
├── cypress/
│   ├── e2e/                 # Tests E2E
│   │   ├── onboarding.cy.ts
│   │   ├── editor-workflow.cy.ts
│   │   └── exercises.cy.ts
│   ├── fixtures/            # Données de test
│   └── support/             # Configuration et commandes
├── jest.setup.js            # Configuration Jest
└── cypress.config.ts        # Configuration Cypress
```

## Commandes de test

### Tests unitaires et d'intégration

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests d'un fichier spécifique
npm test SmartEditor.test.tsx

# Tests avec pattern
npm test -- --testNamePattern="correction"
```

### Tests E2E

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Tests E2E en mode interactif
npm run test:e2e:open

# Tests E2E d'un fichier spécifique
npx cypress run --spec "cypress/e2e/onboarding.cy.ts"

# Tests E2E en mode headless
npx cypress run --headless
```

## Configuration

### Jest

La configuration Jest est définie dans `package.json` :

```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "moduleNameMapping": {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts",
      "!src/app/**/layout.tsx",
      "!src/app/**/page.tsx"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Cypress

La configuration Cypress est dans `cypress.config.ts` :

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
  },
});
```

## Écriture de tests

### Tests unitaires

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });
});
```

### Tests d'intégration

```typescript
// __tests__/integration/user-flow.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SmartEditor } from '@/components/editor/SmartEditor';

describe('User Flow - Écriture et correction', () => {
  it('permet à l\'utilisateur d\'écrire et de corriger ses erreurs', async () => {
    const user = userEvent.setup();

    render(<SmartEditor />);

    // L'utilisateur tape du texte
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'il manger du pain');

    // L'application détecte les erreurs
    await waitFor(() => {
      expect(screen.getByText('1 suggestion')).toBeInTheDocument();
    });

    // L'utilisateur applique une correction
    const errorHighlight = screen.getByRole('button');
    fireEvent.click(errorHighlight);

    await waitFor(() => {
      expect(screen.getByText('mange')).toBeInTheDocument();
    });

    const suggestionButton = screen.getByText('mange');
    fireEvent.click(suggestionButton);

    await waitFor(() => {
      expect(textarea).toHaveValue('il mange du pain');
    });
  });
});
```

### Tests E2E

```typescript
// cypress/e2e/editor-workflow.cy.ts
describe("Workflow de l'éditeur", () => {
  beforeEach(() => {
    cy.loginTestUser();
    cy.visit('/editor');
  });

  it('permet de saisir du texte et de voir les corrections', () => {
    cy.get('[data-testid="smart-editor"] textarea').type('il manger du pain');

    cy.waitForGrammarCheck();

    cy.get('[data-testid="error-highlight"]').should('be.visible').click();

    cy.get('[data-testid="suggestions-panel"]').should('be.visible').should('contain', 'mange');

    cy.applySuggestion('mange');

    cy.get('[data-testid="smart-editor"] textarea').should('have.value', 'il mange du pain');
  });
});
```

## Mocks et fixtures

### Mocks Jest

```typescript
// jest.setup.js
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

jest.mock('@/hooks/useGrammarCheck', () => ({
  useGrammarCheck: () => ({
    checkGrammar: jest.fn(),
    isChecking: false,
  }),
}));
```

### Fixtures Cypress

```json
// cypress/fixtures/grammar-response.json
{
  "success": true,
  "data": {
    "errors": [
      {
        "offset": 0,
        "length": 6,
        "message": "Erreur de conjugaison",
        "replacements": ["mange"]
      }
    ]
  }
}
```

## Bonnes pratiques

### Tests unitaires

1. **Testez le comportement, pas l'implémentation**

   ```typescript
   // ✅ Bon
   expect(screen.getByText('Bonjour')).toBeInTheDocument();

   // ❌ Éviter
   expect(component.state.message).toBe('Bonjour');
   ```

2. **Utilisez des noms de test descriptifs**

   ```typescript
   // ✅ Bon
   it('affiche un message d\'erreur quand l\'email est invalide', () => {

   // ❌ Éviter
   it('test email validation', () => {
   ```

3. **Organisez les tests avec describe et it**
   ```typescript
   describe('Button', () => {
     describe('quand il est cliqué', () => {
       it('appelle la fonction onClick', () => {});
     });
   });
   ```

### Tests d'intégration

1. **Testez les interactions entre composants**
2. **Utilisez des données réalistes**
3. **Vérifiez les effets de bord**

### Tests E2E

1. **Testez les parcours utilisateur complets**
2. **Utilisez des sélecteurs stables** (`data-testid`)
3. **Évitez les tests fragiles**

## Couverture de code

### Objectifs de couverture

- **Lignes** : 80%
- **Fonctions** : 80%
- **Branches** : 80%
- **Statements** : 80%

### Vérification de la couverture

```bash
# Générer le rapport de couverture
npm run test:coverage

# Ouvrir le rapport HTML
open coverage/lcov-report/index.html
```

### Amélioration de la couverture

1. Identifiez les zones non couvertes
2. Ajoutez des tests pour les cas limites
3. Testez les branches conditionnelles
4. Vérifiez la gestion d'erreurs

## CI/CD et tests

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Débogage des tests

### Tests qui échouent

1. **Lisez le message d'erreur**
2. **Vérifiez les sélecteurs**
3. **Utilisez `screen.debug()`**
4. **Ajoutez des `console.log`**

```typescript
it('debug test', () => {
  render(<MyComponent />);
  screen.debug(); // Affiche le DOM
  console.log(screen.getByRole('button')); // Log l'élément
});
```

### Tests E2E qui échouent

1. **Vérifiez les captures d'écran**
2. **Regardez les vidéos**
3. **Utilisez `cy.pause()`**
4. **Vérifiez les network requests**

```typescript
it('debug E2E test', () => {
  cy.visit('/');
  cy.pause(); // Pause pour inspection
  cy.get('[data-testid="button"]').click();
});
```

## Maintenance des tests

### Refactoring des tests

1. **Mettez à jour les tests lors des changements**
2. **Supprimez les tests obsolètes**
3. **Optimisez les tests lents**
4. **Mettez à jour les mocks**

### Ajout de nouveaux tests

1. **Écrivez les tests avant le code (TDD)**
2. **Couvrez les nouveaux cas d'usage**
3. **Ajoutez des tests de régression**
4. **Documentez les tests complexes**

## Ressources

### Documentation

- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress](https://docs.cypress.io/guides/overview/why-cypress)

### Outils

- [Testing Playground](https://testing-playground.com/)
- [Cypress Real Events](https://github.com/dmtrKovalenko/cypress-real-events)
- [MSW](https://mswjs.io/) - Mock Service Worker

### Bonnes pratiques

- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

_Ce guide est mis à jour régulièrement. Dernière mise à jour : 2024-01-01_
