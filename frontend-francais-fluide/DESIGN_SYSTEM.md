# Guide de Style Professionnel - FrançaisFluide

## 🎯 Objectif
Ce guide définit les standards de design professionnel pour maintenir la cohérence visuelle et l'expérience utilisateur de FrançaisFluide.

## 🎨 Palette de Couleurs

### Couleurs Primaires
```css
--color-primary-900: #0F172A;  /* Noir bleuté - textes principaux */
--color-primary-800: #1E293B;  /* Headers et titres */
--color-primary-700: #334155;  /* Texte secondaire */
--color-primary-600: #475569;  /* Texte désactivé */
--color-primary-500: #64748B;  /* Bordures et séparateurs */
```

### Accent Professionnel
```css
--color-accent-600: #1E40AF;   /* Bleu foncé principal */
--color-accent-500: #2563EB;   /* Bleu action */
--color-accent-400: #3B82F6;   /* Hover states */
--color-accent-100: #DBEAFE;   /* Backgrounds légers */
```

### Couleurs Sémantiques
```css
--color-success: #059669;      /* Vert professionnel */
--color-warning: #D97706;      /* Orange sobre */
--color-error: #DC2626;        /* Rouge corporate */
--color-info: #0891B2;         /* Cyan informatif */
```

### Neutres
```css
--color-gray-50: #FAFAFA;      /* Backgrounds */
--color-gray-100: #F5F5F5;     /* Cards */
--color-gray-200: #E5E7EB;     /* Bordures légères */
--color-gray-300: #D1D5DB;     /* Bordures */
--color-gray-400: #9CA3AF;     /* Texte secondaire */
--color-gray-500: #6B7280;     /* Texte désactivé */
--color-gray-600: #4B5563;     /* Texte normal */
--color-gray-700: #374151;     /* Texte foncé */
--color-gray-800: #1F2937;     /* Headers */
--color-gray-900: #111827;     /* Texte principal */
```

## 📝 Typographie

### Familles de Polices
- **Sans-serif**: Inter (corps de texte, interface)
- **Display**: Playfair Display (titres principaux uniquement)

### Échelle Typographique
```css
--text-xs: 0.75rem;     /* 12px - Labels, badges */
--text-sm: 0.875rem;    /* 14px - Texte secondaire */
--text-base: 1rem;      /* 16px - Corps de texte */
--text-lg: 1.125rem;    /* 18px - Sous-titres */
--text-xl: 1.25rem;     /* 20px - Titres de section */
--text-2xl: 1.5rem;     /* 24px - Titres moyens */
--text-3xl: 1.875rem;   /* 30px - Titres grands */
--text-4xl: 2.25rem;    /* 36px - Titres très grands */
--text-5xl: 3rem;       /* 48px - Titres héro */
```

### Line Heights
```css
--leading-tight: 1.25;    /* Titres */
--leading-normal: 1.5;    /* Corps de texte */
--leading-relaxed: 1.625; /* Texte long */
```

## 🧩 Composants

### Cards
```css
.professional-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.professional-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Boutons
```css
/* Primary */
.btn-primary {
  background-color: #2563EB;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #3B82F6;
}

/* Secondary */
.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #D1D5DB;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #F9FAFB;
  border-color: #9CA3AF;
}
```

### Inputs
```css
.input-professional {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.input-professional:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

## 📏 Espacements

### Système de 8px
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## 🎭 Animations

### Transitions Subtiles
```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;
```

### Animations Autorisées
- `fadeIn`: Apparition subtile (0.3s)
- `hover`: Changements de couleur/ombre uniquement
- `loading`: Spinners simples

### Animations Interdites
- ❌ Transform scale/translate excessifs
- ❌ Rotations continues
- ❌ Animations "bounce" ou "pulse"
- ❌ Gradients animés
- ❌ Effets de "float"

## 🚫 Éléments Interdits

### Émojis
- ❌ Aucun émoji dans l'interface
- ✅ Utiliser des icônes Lucide à la place

### Couleurs
- ❌ Dégradés arc-en-ciel
- ❌ Couleurs néon ou fluorescentes
- ❌ Couleurs pastel excessives

### Textes
- ❌ Langage familier ou informel
- ❌ Exclamations excessives
- ❌ Textes "fun" ou ludiques

### Animations
- ❌ Transform hover excessifs
- ❌ Animations de "bounce"
- ❌ Effets de "glow" ou "pulse"

## ✅ Bonnes Pratiques

### Hiérarchie Visuelle
1. **Titres**: Utiliser la hiérarchie h1 → h6
2. **Contraste**: Minimum 4.5:1 pour le texte
3. **Espacement**: Utiliser le système de 8px
4. **Alignement**: Aligner sur une grille cohérente

### Accessibilité
- Focus states visibles
- Contraste suffisant
- Navigation au clavier
- Labels descriptifs

### Responsive Design
- Mobile-first approach
- Breakpoints cohérents
- Images adaptatives
- Typographie fluide

## 🔧 Implémentation

### Fichiers de Configuration
- `src/styles/design-system.ts` - Configuration TypeScript
- `src/styles/professional-theme.css` - Variables CSS
- `tailwind.config.js` - Configuration Tailwind

### Composants de Base
- `src/components/ui/professional/` - Composants réutilisables
- `src/constants/professional-texts.ts` - Textes standardisés

### Utilisation
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { MetricCard } from '@/components/ui/professional/MetricCard';
```

## 📋 Checklist de Validation

### Design
- [ ] Aucun émoji visible
- [ ] Couleurs de la palette professionnelle
- [ ] Typographie cohérente
- [ ] Espacements du système 8px
- [ ] Animations subtiles uniquement

### Contenu
- [ ] Textes formels et professionnels
- [ ] Terminologie cohérente
- [ ] Messages d'erreur clairs
- [ ] Instructions précises

### Technique
- [ ] Composants réutilisables
- [ ] Classes CSS cohérentes
- [ ] Accessibilité respectée
- [ ] Performance optimisée

---

**Note**: Ce guide doit être suivi par tous les développeurs travaillant sur l'interface utilisateur de FrançaisFluide pour maintenir la cohérence et la qualité professionnelle.
