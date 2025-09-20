# 🚀 FrançaisFluide - Application d'Apprentissage Intelligent du Français

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)

Une application révolutionnaire qui transforme l'apprentissage du français en une expérience intuitive et engageante grâce à l'IA adaptative, la gamification et des corrections en temps réel.

## ✨ Fonctionnalités principales

- **🤖 Correction IA en temps réel** - Détection et correction instantanée des fautes pendant la frappe
- **🎮 Gamification complète** - Système de niveaux, achievements, missions quotidiennes
- **📊 Analyse adaptative** - Apprentissage personnalisé selon vos forces et faiblesses
- **⚡ Performance optimale** - Interface ultra-rapide avec animations fluides
- **🎨 Design moderne** - Interface intuitive avec mode sombre/clair
- **📱 Responsive** - Fonctionne parfaitement sur tous les appareils
- **🔄 Synchronisation temps réel** - WebSocket pour collaboration et sync multi-appareils
- **📈 Statistiques détaillées** - Suivi complet de votre progression

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand avec persistence
- **Animations**: Framer Motion 11
- **Data Fetching**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend (À implémenter)
- **Runtime**: Node.js 20+
- **Framework**: Express/Fastify ou Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **WebSocket**: Socket.io
- **Auth**: NextAuth.js ou Supabase Auth

### IA & NLP
- **Correction**: API Claude/GPT-4 ou LanguageTool
- **Analyse**: Natural.js pour traitement local
- **Détection**: Règles regex + ML patterns

## 📦 Installation

### Prérequis
- Node.js 18+ et npm/yarn/pnpm
- Git
- Éditeur de code (VS Code recommandé)

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/francais-fluide.git
cd francais-fluide
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/francais_fluide

# External Services (optionnel pour commencer)
OPENAI_API_KEY=your-openai-key
CLAUDE_API_KEY=your-claude-key

# Analytics (optionnel)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4. Lancer le serveur de développement

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🏗️ Architecture du Projet

```
francais-fluide/
├── src/
│   ├── app/                    # Pages et layouts Next.js
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── dashboard/          # Dashboard utilisateur
│   │   ├── editor/             # Éditeur intelligent
│   │   └── api/                # API Routes
│   │
│   ├── components/             # Composants React
│   │   ├── editor/             # Composants éditeur
│   │   ├── gamification/       # Composants gamification
│   │   ├── feedback/           # Composants feedback
│   │   └── ui/                 # Composants UI de base
│   │
│   ├── lib/                    # Logique métier
│   │   ├── grammar/            # Moteur de détection
│   │   ├── ai/                 # Intégration IA
│   │   ├── api/                # Client API
│   │   └── utils/              # Utilitaires
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Stores Zustand
│   ├── types/                  # Types TypeScript
│   └── constants/              # Constantes
│
├── public/                     # Assets statiques
├── tests/                      # Tests
└── [fichiers config]           # Configuration
```

## 🚀 Démarrage Rapide

### Étape 1 : Explorer l'éditeur intelligent

1. Cliquez sur "Essayer maintenant" sur la page d'accueil
2. Commencez à taper du texte avec des fautes volontaires
3. Observez les corrections en temps réel
4. Cliquez sur les suggestions pour les appliquer

### Étape 2 : Tester le système de gamification

1. Naviguez vers le Dashboard
2. Consultez vos statistiques et progression
3. Complétez des missions quotidiennes
4. Débloquez des achievements

### Étape 3 : Personnaliser l'expérience

1. Accédez aux paramètres
2. Ajustez le niveau de difficulté
3. Activez/désactivez les fonctionnalités
4. Choisissez vos domaines de focus

## 📝 Développement

### Structure des Commandes

```bash
# Développement
npm run dev              # Lance le serveur de développement

# Build & Production
npm run build           # Build pour production
npm run start           # Lance le serveur de production

# Qualité du Code
npm run lint            # Vérifie le linting
npm run type-check      # Vérifie les types TypeScript
npm run format          # Formate le code avec Prettier

# Tests
npm run test            # Lance les tests en mode watch
npm run test:ci         # Lance les tests en mode CI
```

### Ajout de Nouvelles Fonctionnalités

#### 1. Créer un nouveau composant

```tsx
// src/components/MonComposant.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface MonComposantProps {
  title: string;
  className?: string;
}

export const MonComposant: FC<MonComposantProps> = ({ 
  title, 
  className 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("p-4 rounded-lg", className)}
    >
      <h2>{title}</h2>
    </motion.div>
  );
};
```

#### 2. Ajouter une règle de grammaire

```typescript
// src/lib/grammar/custom-rules.ts
export const customRule: GrammarRule = {
  id: 'ma-regle',
  category: 'grammar',
  severity: 'warning',
  pattern: /pattern/gi,
  check: (match) => {
    // Logique de vérification
    return {
      message: 'Description de l\'erreur',
      suggestions: ['suggestion1', 'suggestion2']
    };
  }
};
```

#### 3. Créer un nouveau store

```typescript
// src/store/monStore.ts
import { create } from 'zustand';

interface MonState {
  value: string;
  setValue: (value: string) => void;
}

export const useMonStore = create<MonState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

## 🔧 Configuration Avancée

### Intégration IA Externe

Pour activer les corrections IA avancées :

1. **OpenAI GPT-4**:
```typescript
// src/lib/ai/openai-adapter.ts
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{ role: "system", content: prompt }],
});
```

2. **Anthropic Claude**:
```typescript
// src/lib/ai/claude-adapter.ts
const response = await anthropic.messages.create({
  model: "claude-3-opus",
  messages: [{ role: "user", content: text }],
});
```

### Optimisation des Performances

1. **Lazy Loading**:
```tsx
const MonComposant = dynamic(() => import('./MonComposant'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

2. **Mémoïzation**:
```tsx
const resultat = useMemo(() => 
  calculComplexe(data), [data]
);
```

3. **Debouncing**:
```tsx
const debouncedValue = useDebounce(value, 500);
```

## 🧪 Tests

### Tests Unitaires

```bash
npm run test
```

Exemple de test :
```typescript
// __tests__/grammar.test.ts
import { grammarDetector } from '@/lib/grammar/detector';

describe('Grammar Detector', () => {
  it('détecte les erreurs d\'accord', () => {
    const result = grammarDetector.analyze('Un belle maison');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('accord');
  });
});
```

## 📊 Roadmap

### Phase 1 - MVP (En cours) ✅
- [x] Éditeur intelligent avec corrections basiques
- [x] Système de gamification
- [x] Interface responsive
- [x] Architecture modulaire

### Phase 2 - Intégration IA 🚧
- [ ] Intégration GPT-4/Claude pour corrections avancées
- [ ] Analyse contextuelle profonde
- [ ] Suggestions de reformulation
- [ ] Génération d'exercices personnalisés

### Phase 3 - Backend & Multi-utilisateurs 📋
- [ ] API REST complète
- [ ] Base de données PostgreSQL
- [ ] Authentification sécurisée
- [ ] Synchronisation temps réel
- [ ] Mode collaboratif

### Phase 4 - Mobile & Offline 📱
- [ ] Application mobile React Native
- [ ] Mode hors-ligne avec sync
- [ ] PWA avec service workers
- [ ] Notifications push

### Phase 5 - Analytics & ML 📈
- [ ] Dashboard analytics avancé
- [ ] Modèle ML personnalisé
- [ ] Prédiction des difficultés
- [ ] Recommandations adaptatives

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines de Contribution

- Suivre les conventions de code TypeScript/React
- Écrire des tests pour les nouvelles fonctionnalités
- Documenter les changements significatifs
- Utiliser les conventional commits

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- L'équipe Next.js pour le framework incroyable
- Vercel pour l'hébergement et les outils
- La communauté open-source pour les librairies utilisées
- Tous les contributeurs du projet

## 📞 Support

- **Documentation**: [docs.francaisfluide.com](https://docs.francaisfluide.com)
- **Issues**: [GitHub Issues](https://github.com/votre-username/francais-fluide/issues)
- **Discussions**: [GitHub Discussions](https://github.com/votre-username/francais-fluide/discussions)
- **Email**: support@francaisfluide.com

## 🚀 Déploiement

### Vercel (Recommandé)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/votre-username/francais-fluide)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t francais-fluide .
docker run -p 3000:3000 francais-fluide
```

---

**Fait avec ❤️ pour améliorer l'apprentissage du français**