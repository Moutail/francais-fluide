# Guide de Contribution - FrançaisFluide

Merci de votre intérêt à contribuer à FrançaisFluide ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Structure du projet](#structure-du-projet)
- [Standards de code](#standards-de-code)
- [Tests](#tests)
- [Processus de contribution](#processus-de-contribution)
- [Rapport de bugs](#rapport-de-bugs)
- [Suggestions de fonctionnalités](#suggestions-de-fonctionnalités)

## Code de conduite

Ce projet adhère au [Code de Conduite Contributor Covenant](https://www.contributor-covenant.org/). En participant, vous acceptez de respecter ce code.

### Nos engagements

- Créer un environnement accueillant et inclusif
- Respecter les différents points de vue et expériences
- Accepter les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté

## Comment contribuer

### Types de contributions

Nous accueillons plusieurs types de contributions :

1. **Corrections de bugs** - Résolution de problèmes existants
2. **Nouvelles fonctionnalités** - Ajout de nouvelles capacités
3. **Amélioration de la documentation** - Clarification et enrichissement des docs
4. **Optimisation des performances** - Amélioration de la vitesse et de l'efficacité
5. **Tests** - Ajout ou amélioration des tests
6. **Accessibilité** - Amélioration de l'accessibilité
7. **Traductions** - Ajout de nouvelles langues

### Première contribution

Si c'est votre première contribution, nous recommandons de :

1. Commencer par des issues marquées `good first issue`
2. Lire attentivement ce guide
3. Configurer l'environnement de développement
4. Créer une branche pour votre contribution
5. Tester vos modifications
6. Soumettre une pull request

## Configuration de l'environnement

### Prérequis

- Node.js 18+
- npm ou yarn
- Git
- Un éditeur de code (VS Code recommandé)

### Installation

1. **Fork et cloner le repository**

   ```bash
   git clone https://github.com/votre-username/francais-fluide.git
   cd francais-fluide
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   ```bash
   cp .env.example .env.local
   # Éditer .env.local avec vos valeurs
   ```

4. **Démarrer le serveur de développement**

   ```bash
   npm run dev
   ```

5. **Vérifier l'installation**
   ```bash
   npm run test
   npm run lint
   ```

### Outils recommandés

- **VS Code** avec les extensions :
  - ESLint
  - Prettier
  - TypeScript Importer
  - Auto Rename Tag
  - Bracket Pair Colorizer

## Structure du projet

```
frontend-francais-fluide/
├── src/
│   ├── app/                 # Pages Next.js
│   ├── components/          # Composants React
│   ├── hooks/              # Hooks personnalisés
│   ├── lib/                # Utilitaires et services
│   ├── store/              # État global (Zustand)
│   ├── types/              # Types TypeScript
│   └── constants/          # Constantes
├── __tests__/              # Tests unitaires et d'intégration
├── cypress/                # Tests E2E
├── public/                 # Assets statiques
└── docs/                   # Documentation
```

### Architecture

- **Frontend** : Next.js 14 avec App Router
- **Styling** : Tailwind CSS
- **État** : Zustand
- **Tests** : Jest + React Testing Library + Cypress
- **Linting** : ESLint + Prettier

## Standards de code

### TypeScript

- Utilisez TypeScript strict
- Définissez des types explicites
- Évitez `any` sauf cas exceptionnels
- Utilisez les interfaces pour les objets

```typescript
// ✅ Bon
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Éviter
const user: any = { ... };
```

### React

- Utilisez des composants fonctionnels
- Utilisez les hooks appropriés
- Nommez les composants en PascalCase
- Utilisez des props typées

```typescript
// ✅ Bon
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### CSS / Styling

- Utilisez Tailwind CSS
- Organisez les classes par catégories
- Utilisez des classes utilitaires
- Évitez les styles inline

```typescript
// ✅ Bon
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold text-gray-900">
    Titre
  </h2>
  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
    Action
  </button>
</div>
```

### Nommage

- **Fichiers** : kebab-case (`smart-editor.tsx`)
- **Composants** : PascalCase (`SmartEditor`)
- **Variables/fonctions** : camelCase (`getUserData`)
- **Constantes** : UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces** : PascalCase (`UserProfile`)

## Tests

### Stratégie de tests

Nous visons une couverture de 80% avec :

1. **Tests unitaires** (Jest + RTL) - 60%
2. **Tests d'intégration** (Jest + RTL) - 20%
3. **Tests E2E** (Cypress) - 20%

### Écriture de tests

```typescript
// Test unitaire
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
});
```

### Commandes de test

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E en mode interactif
npm run test:e2e:open
```

### Bonnes pratiques pour les tests

- Testez le comportement, pas l'implémentation
- Utilisez des noms de test descriptifs
- Organisez les tests avec `describe` et `it`
- Mockez les dépendances externes
- Testez les cas limites et d'erreur

## Processus de contribution

### 1. Créer une issue

Avant de commencer à coder, créez une issue pour :

- Discuter de la fonctionnalité
- Signaler un bug
- Proposer une amélioration

### 2. Créer une branche

```bash
# Créer une branche depuis main
git checkout main
git pull origin main
git checkout -b feature/nom-de-la-fonctionnalite

# Ou pour un bug fix
git checkout -b fix/nom-du-bug
```

### 3. Développer

- Écrivez du code propre et documenté
- Ajoutez des tests appropriés
- Respectez les standards de code
- Commitez régulièrement avec des messages clairs

```bash
git add .
git commit -m "feat: ajouter la correction automatique des erreurs de conjugaison"
```

### 4. Tests et linting

```bash
# Vérifier le linting
npm run lint

# Corriger automatiquement si possible
npm run lint:fix

# Lancer les tests
npm run test

# Vérifier la couverture
npm run test:coverage
```

### 5. Pull Request

1. **Pusher votre branche**

   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```

2. **Créer une Pull Request**
   - Remplissez le template de PR
   - Ajoutez une description claire
   - Liez les issues concernées
   - Ajoutez des captures d'écran si nécessaire

3. **Révision de code**
   - Répondez aux commentaires
   - Effectuez les modifications demandées
   - Maintenez une discussion constructive

### Template de Pull Request

```markdown
## Description

Brève description des changements

## Type de changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests E2E ajoutés/mis à jour

## Checklist

- [ ] Code respecte les standards du projet
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Aucun conflit avec main
```

## Rapport de bugs

### Avant de reporter

1. Vérifiez que le bug n'a pas déjà été signalé
2. Testez avec la dernière version
3. Vérifiez la documentation

### Template de bug report

```markdown
## Description du bug

Description claire du problème

## Étapes pour reproduire

1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Comportement attendu

Description du comportement attendu

## Comportement actuel

Description du comportement actuel

## Captures d'écran

Si applicable, ajoutez des captures d'écran

## Environnement

- OS: [ex. Windows 10]
- Navigateur: [ex. Chrome 91]
- Version: [ex. 1.0.0]

## Informations supplémentaires

Toute autre information pertinente
```

## Suggestions de fonctionnalités

### Avant de suggérer

1. Vérifiez que la fonctionnalité n'existe pas déjà
2. Consultez la roadmap du projet
3. Vérifiez les issues existantes

### Template de feature request

```markdown
## Résumé

Description courte de la fonctionnalité

## Problème à résoudre

Quel problème cette fonctionnalité résout-elle ?

## Solution proposée

Description détaillée de la solution

## Alternatives considérées

Autres solutions envisagées

## Informations supplémentaires

Toute autre information pertinente
```

## Ressources utiles

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io)

### Communauté

- [Discord](https://discord.gg/francais-fluide)
- [GitHub Discussions](https://github.com/francais-fluide/francais-fluide/discussions)
- [Twitter](https://twitter.com/francais_fluide)

### Support

Si vous avez des questions :

1. Consultez la documentation
2. Recherchez dans les issues existantes
3. Posez votre question dans GitHub Discussions
4. Contactez l'équipe sur Discord

## Reconnaissance

Merci à tous les contributeurs qui rendent ce projet possible ! Votre aide est précieuse et appréciée.

---

**Note** : Ce guide est en constante évolution. N'hésitez pas à suggérer des améliorations via une issue ou une pull request.
