# 🇫🇷 FrançaisFluide

**L'application intelligente qui transforme l'apprentissage du français en une expérience intuitive et engageante.**

## 🚀 Fonctionnalités

### ✨ Interface Moderne
- **Design responsive** qui s'adapte à tous les écrans
- **Animations fluides** avec Framer Motion
- **Navigation intuitive** avec indicateurs visuels
- **Thème cohérent** avec gradients et effets visuels

### 🧠 IA Avancée
- **Correction en temps réel** avec suggestions intelligentes
- **Assistant conversationnel** pour répondre aux questions
- **Génération d'exercices** personnalisés
- **Analyse de progression** avec métriques détaillées

### 📚 Apprentissage Gamifié
- **Système de points** et de niveaux
- **Défis quotidiens** et objectifs personnalisés
- **Succès et récompenses** pour motiver l'apprentissage
- **Suivi de progression** avec graphiques interactifs

### 🎯 Exercices Adaptatifs
- **Types variés** : grammaire, vocabulaire, conjugaison, orthographe
- **Niveaux de difficulté** adaptés au profil utilisateur
- **Feedback immédiat** avec explications pédagogiques
- **Exercices personnalisés** basés sur les erreurs

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router** pour la navigation moderne
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **React Query** pour la gestion des données

### IA et Analytics
- **OpenAI GPT-4** / **Claude API** pour les corrections avancées
- **LanguageTool** comme fallback
- **Sentry** pour le monitoring des erreurs
- **Google Analytics** / **Plausible** pour les analytics

### Performance
- **Code splitting** automatique
- **Lazy loading** des composants
- **Optimisation des images** avec Next.js
- **Cache intelligent** pour les corrections IA

## 🛠️ Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Installation rapide

```bash
# Cloner le projet
git clone https://github.com/votre-username/francais-fluide.git
cd francais-fluide/frontend-francais-fluide

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📱 Pages Disponibles

### 🏠 Page d'Accueil (`/`)
- Présentation des fonctionnalités
- Statistiques animées
- Démonstration interactive
- Appels à l'action

### 📊 Progression (`/progression`)
- Tableau de bord complet
- Graphiques de progression
- Objectifs et défis
- Succès et récompenses

### 📚 Exercices (`/exercices`)
- Catalogue d'exercices
- Filtres par type et difficulté
- Interface d'exercice interactive
- Résultats et explications

### 🎮 Démo Interactive (`/demo`)
- Parcours guidé des fonctionnalités
- Exemples pratiques
- Explications pédagogiques
- Découverte progressive

### 🔐 Authentification
- **Connexion** (`/auth/login`)
- **Inscription** (`/auth/register`)
- Validation en temps réel
- Gestion des erreurs

## 🎨 Navigation

### Barre de Navigation
- **Logo animé** avec effet de rotation
- **Menu responsive** avec animations
- **Indicateurs d'état** pour la page active
- **Menu utilisateur** avec actions rapides

### Navigation Mobile
- **Menu hamburger** avec animations
- **Navigation tactile** optimisée
- **Overlay responsive** pour les sous-menus

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` :

```bash
# APIs IA (optionnel)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Monitoring (optionnel)
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_GA_ID=G-...

# Base de données (optionnel)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### Configuration IA

L'application fonctionne parfaitement sans clés API, mais pour activer les fonctionnalités IA avancées :

1. **OpenAI** : Obtenez une clé sur [platform.openai.com](https://platform.openai.com)
2. **Claude** : Obtenez une clé sur [console.anthropic.com](https://console.anthropic.com)
3. **LanguageTool** : Utilisé automatiquement comme fallback

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Docker
```bash
# Build de l'image
docker build -f Dockerfile.production -t francais-fluide .

# Lancement avec Docker Compose
docker-compose up -d
```

### Variables de Production
- Configurez les variables d'environnement sur votre plateforme
- Activez les services de monitoring
- Configurez les CDN pour les assets

## 📊 Monitoring

### Métriques Disponibles
- **Performance** : Web Vitals, temps de chargement
- **Utilisation** : Pages vues, interactions utilisateur
- **Erreurs** : Tracking automatique avec Sentry
- **IA** : Coûts, quotas, taux de succès

### Dashboards
- **Performance** : Métriques en temps réel
- **Analytics** : Comportement utilisateur
- **IA** : Monitoring des APIs et coûts
- **Système** : Santé de l'application

## 🧪 Tests

### Tests Unitaires
```bash
npm run test
```

### Tests E2E
```bash
npm run test:e2e
```

### Couverture de Code
```bash
npm run test:coverage
```

## 🤝 Contribution

### Structure du Projet
```
src/
├── app/                 # Pages Next.js
├── components/          # Composants React
│   ├── editor/         # Éditeur intelligent
│   ├── navigation/     # Navigation
│   └── ui/             # Composants UI
├── lib/                # Utilitaires
│   ├── ai/            # Intégrations IA
│   ├── grammar/       # Moteur de correction
│   ├── monitoring/    # Monitoring
│   └── performance/   # Optimisations
└── hooks/              # Hooks React
```

### Guidelines
- **TypeScript** strict
- **ESLint** et **Prettier** configurés
- **Conventional Commits** pour les messages
- **Tests** requis pour les nouvelles fonctionnalités

## 📄 Licence

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

### Documentation
- **Guide utilisateur** : [docs/user-guide.md](docs/user-guide.md)
- **Guide développeur** : [docs/developer-guide.md](docs/developer-guide.md)
- **API Reference** : [docs/api.md](docs/api.md)

### Contact
- **Issues** : [GitHub Issues](https://github.com/votre-username/francais-fluide/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/francais-fluide/discussions)
- **Email** : support@francais-fluide.com

---

**Fait avec ❤️ pour l'apprentissage du français**