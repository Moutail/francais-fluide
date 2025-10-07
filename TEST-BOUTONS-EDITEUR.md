# 🧪 Tests des Boutons de l'Éditeur

Date : 7 octobre 2025  
Objectif : Vérifier que tous les boutons fonctionnent correctement

---

## 🎯 Boutons à Tester

1. ✅ **Réinitialiser** - Efface tout le texte
2. ✅ **Sauvegarder** - Sauvegarde le texte localement
3. ✅ **Exporter** - Télécharge un fichier .txt
4. ✅ **Partager** - Partage ou copie le texte

---

## 📋 Procédure de Test

### Étape 1 : Ouvrir l'Éditeur

```
1. Aller sur http://localhost:3000/editor
2. Ouvrir la console du navigateur (F12)
3. Onglet "Console"
```

### Étape 2 : Taper du Texte

```
1. Cliquer dans l'éditeur
2. Taper : "Bonjour, ceci est un test pour vérifier les boutons de l'éditeur."
3. Attendre 2 secondes
```

### Étape 3 : Tester Réinitialiser

```
1. Cliquer sur le bouton "Réinitialiser" (icône RotateCcw)
2. ✅ Vérifier dans la console :
   - "🔍 handleReset appelé"
3. ✅ Vérifier la popup de confirmation
4. Cliquer "OK"
5. ✅ Vérifier dans la console :
   - "✅ Confirmation reçue"
   - "✅ Éditeur réinitialisé"
6. ✅ Vérifier que le texte est effacé
```

**Si ça ne fonctionne pas** :
- Vérifier s'il y a des erreurs dans la console
- Vérifier que le bouton est bien cliquable (pas de `pointer-events: none`)

### Étape 4 : Tester Sauvegarder

```
1. Taper du texte à nouveau
2. Cliquer sur le bouton "Sauvegarder" (icône Save)
3. ✅ Vérifier dans la console :
   - "🔍 handleSave appelé"
   - "📝 Texte actuel: ..."
   - "📊 Métriques: ..."
   - "✅ Texte sauvegardé localement"
4. ✅ Vérifier l'alerte : "✅ Texte sauvegardé avec succès !"
5. ✅ Vérifier dans localStorage :
   - Dans la console : `localStorage.getItem('editor_draft')`
   - Doit retourner un JSON avec le texte
```

**Si ça ne fonctionne pas** :
- Vérifier si `text` est vide dans la console
- Vérifier s'il y a une erreur "Aucun texte à sauvegarder"

### Étape 5 : Tester Exporter

```
1. Cliquer sur le bouton "Exporter" (icône Download)
2. ✅ Vérifier qu'un fichier est téléchargé
3. ✅ Nom du fichier : `francais-fluide-2025-10-07.txt`
4. ✅ Ouvrir le fichier
5. ✅ Vérifier le contenu :
   - En-tête avec date
   - Texte complet
   - Statistiques (caractères, mots, lignes)
```

**Si ça ne fonctionne pas** :
- Vérifier les permissions de téléchargement du navigateur
- Vérifier s'il y a une erreur dans la console

### Étape 6 : Tester Partager

```
1. Cliquer sur le bouton "Partager" (icône Share2)
2. ✅ Vérifier dans la console :
   - "🔍 handleShare appelé"
   - "📝 Texte à partager: ..."
   - "🔄 Tentative de partage..."

Sur Mobile :
3. ✅ Menu de partage natif apparaît
4. ✅ Options : WhatsApp, Email, etc.

Sur Desktop :
3. ✅ Alerte : "✅ Lien copié dans le presse-papiers !"
4. ✅ Coller (Ctrl+V) dans un éditeur de texte
5. ✅ Vérifier le contenu copié
```

**Si ça ne fonctionne pas** :
- Vérifier les permissions du presse-papiers
- Essayer dans un autre navigateur

---

## 🔍 Commandes de Débogage

### Dans la Console du Navigateur

```javascript
// 1. Vérifier que les boutons existent
console.log('Nombre de boutons:', document.querySelectorAll('button').length);

// 2. Trouver le bouton Réinitialiser
const resetBtn = Array.from(document.querySelectorAll('button'))
  .find(btn => btn.textContent?.includes('Réinitialiser') || btn.textContent?.includes('Reset'));
console.log('Bouton Réinitialiser:', resetBtn);

// 3. Trouver le bouton Sauvegarder
const saveBtn = Array.from(document.querySelectorAll('button'))
  .find(btn => btn.textContent?.includes('Sauvegarder') || btn.textContent?.includes('Save'));
console.log('Bouton Sauvegarder:', saveBtn);

// 4. Trouver le bouton Partager
const shareBtn = Array.from(document.querySelectorAll('button'))
  .find(btn => btn.textContent?.includes('Partager') || btn.textContent?.includes('Share'));
console.log('Bouton Partager:', shareBtn);

// 5. Vérifier localStorage
console.log('Brouillon:', localStorage.getItem('editor_draft'));

// 6. Forcer un clic (si le bouton ne réagit pas)
resetBtn?.click();
saveBtn?.click();
shareBtn?.click();
```

---

## ✅ Résultats Attendus

### Bouton Réinitialiser

```
Console :
🔍 handleReset appelé
✅ Confirmation reçue
✅ Éditeur réinitialisé

Interface :
- Popup de confirmation
- Texte effacé
- Métriques réinitialisées
```

### Bouton Sauvegarder

```
Console :
🔍 handleSave appelé
📝 Texte actuel: "Bonjour, ceci est un test..."
📊 Métriques: {wordsWritten: 10, ...}
✅ Texte sauvegardé localement

Interface :
- Alerte "✅ Texte sauvegardé avec succès !"
- Bouton désactivé pendant la sauvegarde
- Texte "Sauvegarde..." pendant l'opération
```

### Bouton Exporter

```
Console :
✅ Texte exporté avec succès

Interface :
- Fichier téléchargé : francais-fluide-2025-10-07.txt
- Alerte "✅ Texte exporté avec succès !"

Contenu du fichier :
========================================
Français Fluide - Export de texte
========================================
Date: 07/10/2025 12:10:00
Mode: practice
Mots écrits: 10
Précision: 95%
========================================

Bonjour, ceci est un test...

========================================
Statistiques:
- Caractères: 50
- Mots: 10
- Lignes: 1
========================================
```

### Bouton Partager

```
Console :
🔍 handleShare appelé
📝 Texte à partager: "Bonjour, ceci est un test..."
🔄 Tentative de partage...
✅ Texte partagé avec succès

Interface (Mobile) :
- Menu de partage natif

Interface (Desktop) :
- Alerte "✅ Lien copié dans le presse-papiers !"
- Presse-papiers contient le texte + statistiques
```

---

## 🐛 Problèmes Courants

### Problème 1 : Bouton ne réagit pas

**Symptômes** :
- Clic sur le bouton ne fait rien
- Pas de log dans la console

**Solutions** :
1. Vérifier qu'il n'y a pas d'erreur JavaScript dans la console
2. Vérifier que le bouton n'est pas désactivé (`disabled`)
3. Vérifier le CSS : `pointer-events: auto`
4. Essayer de cliquer plusieurs fois
5. Rafraîchir la page (Ctrl+R)

### Problème 2 : "Aucun texte à sauvegarder"

**Symptômes** :
- Alerte "⚠️ Aucun texte à sauvegarder"
- Texte visible dans l'éditeur

**Solutions** :
1. Vérifier que `SmartEditor` met à jour le texte
2. Ajouter `onChange={(newText) => setText(newText)}` à SmartEditor
3. Vérifier dans la console : `console.log('text:', text)`

### Problème 3 : Erreur 400 sur sauvegarde

**Symptômes** :
- Console : "Erreur HTTP 400"
- Sauvegarde échoue

**Solutions** :
1. ✅ Déjà corrigé : Sauvegarde locale en priorité
2. Le serveur est optionnel
3. Vérifier que localStorage fonctionne

### Problème 4 : Partage ne fonctionne pas

**Symptômes** :
- Rien ne se passe au clic
- Pas de menu de partage

**Solutions** :
1. Vérifier les permissions du navigateur
2. Essayer sur mobile (Web Share API)
3. Fallback : Copie dans le presse-papiers
4. Vérifier que HTTPS est activé (requis pour clipboard)

---

## 📊 Rapport de Test

Remplir après les tests :

```
Date : ___________
Navigateur : ___________
OS : ___________

[ ] Bouton Réinitialiser fonctionne
[ ] Bouton Sauvegarder fonctionne
[ ] Bouton Exporter fonctionne
[ ] Bouton Partager fonctionne

[ ] Logs de débogage visibles
[ ] Pas d'erreur JavaScript
[ ] localStorage fonctionne
[ ] Fichier exporté correct

Problèmes rencontrés :
_________________________________
_________________________________
_________________________________

Solutions appliquées :
_________________________________
_________________________________
_________________________________
```

---

## 🎯 Prochaines Étapes

Si tous les tests passent :
- ✅ Les boutons fonctionnent correctement
- ✅ Retirer les logs de débogage (optionnel)
- ✅ Déployer en production

Si des tests échouent :
- 🔍 Suivre les solutions proposées
- 📝 Documenter le problème
- 🛠️ Appliquer les corrections
- 🔄 Retester

---

**Bonne chance pour les tests !** 🚀
