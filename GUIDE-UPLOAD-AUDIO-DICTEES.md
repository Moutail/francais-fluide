# 📝 Guide : Comment Uploader un Audio pour une Dictée

Date : 7 octobre 2025

---

## 🎯 Étapes pour Uploader un Audio

### Étape 1 : Accéder à la Page Admin

```
1. Se connecter en tant qu'admin
   Email : admin@francais-fluide.com
   Mot de passe : Admin123!

2. Aller dans le menu Admin

3. Cliquer sur "Dictées"
```

### Étape 2 : Créer une Nouvelle Dictée

```
1. Cliquer sur le bouton "Nouvelle dictée" (en haut à droite)
   - Bouton bleu avec icône "+"

2. Le formulaire de création s'affiche
```

### Étape 3 : Remplir le Formulaire

```
1. Titre : "Ma dictée"
2. Catégorie : "Nature" (par exemple)
3. Difficulté : Choisir beginner/intermediate/advanced
4. Durée : 5 minutes
5. Description : "Description de la dictée"
6. Texte : "Le texte complet de la dictée..."
```

### Étape 4 : Uploader l'Audio

**Option A : Drag & Drop (Glisser-Déposer)**

```
1. Trouver la section "Fichier Audio"
   - Zone avec bordure en pointillés
   - Icône de musique 🎵

2. Glisser votre fichier audio (MP3, WAV, OGG)
   - Depuis votre ordinateur
   - Directement dans la zone

3. Le fichier est automatiquement uploadé
   - Barre de progression s'affiche
   - Preview audio apparaît

4. ✅ Message de confirmation
   - "Audio téléversé : /audio/dictations/fichier.mp3"
```

**Option B : Cliquer pour Sélectionner**

```
1. Trouver la section "Fichier Audio"

2. Cliquer sur le bouton "Choisir un fichier"

3. Sélectionner votre fichier audio

4. Cliquer "Ouvrir"

5. ✅ Upload automatique
```

**Option C : Saisir une URL Manuellement**

```
1. Trouver la section "Ou saisir une URL audio manuellement"

2. Coller l'URL de votre fichier audio
   Exemple : https://exemple.com/audio.mp3

3. L'URL est enregistrée
```

### Étape 5 : Enregistrer la Dictée

```
1. Vérifier que tous les champs sont remplis

2. Cliquer sur "Enregistrer" (bouton vert)

3. ✅ La dictée est créée avec l'audio
```

---

## 🔍 Problème : Section Upload Audio Non Visible

### Symptômes

- Le formulaire s'affiche
- Je vois le champ "URL audio manuellement"
- **Mais pas la zone de drag & drop**

### Solutions

#### Solution 1 : Vérifier la Console du Navigateur

```
1. Ouvrir la page Admin → Dictées
2. Cliquer sur "Nouvelle dictée"
3. Appuyer sur F12 (ouvrir la console)
4. Onglet "Console"
5. Vérifier s'il y a des erreurs en rouge
```

**Erreurs possibles** :
- `Cannot find module 'AudioUploader'`
- `Unexpected token`
- `Failed to compile`

#### Solution 2 : Vérifier que le Composant est Chargé

Dans la console du navigateur :

```javascript
// Vérifier que le composant existe
console.log('AudioUploader:', document.querySelector('[class*="audio"]'));

// Vérifier les sections du formulaire
const sections = document.querySelectorAll('.space-y-2');
console.log('Sections:', sections.length);
```

#### Solution 3 : Redémarrer le Serveur Frontend

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
cd frontend-francais-fluide
npm run dev
```

#### Solution 4 : Vérifier l'Ordre des Éléments

Le formulaire devrait afficher dans cet ordre :
1. Titre, Catégorie
2. Difficulté, Durée
3. Description
4. Texte de la dictée
5. **📁 Section "Fichier Audio" (avec drag & drop)**
6. Section "Ou saisir une URL manuellement"
7. Boutons Enregistrer / Annuler

Si la section 5 manque, il y a un problème de rendu.

---

## 🛠️ Solution Temporaire : Utiliser l'URL Manuelle

En attendant que le drag & drop s'affiche :

### Étape 1 : Uploader votre Audio Ailleurs

```
1. Uploader votre fichier MP3 sur :
   - Google Drive
   - Dropbox
   - Un serveur web
   - Cloudinary

2. Obtenir l'URL publique du fichier
   Exemple : https://drive.google.com/file/d/xxx/audio.mp3
```

### Étape 2 : Copier l'URL dans le Formulaire

```
1. Dans le champ "Ou saisir une URL audio manuellement"
2. Coller l'URL complète
3. Enregistrer la dictée
```

### Étape 3 : Vérifier que l'Audio Fonctionne

```
1. Aller sur la page Dictées (utilisateur)
2. Sélectionner votre dictée
3. Vérifier que l'audio se lit
```

---

## 🔧 Débogage Avancé

### Vérifier que AudioUploader.tsx Existe

```bash
# Dans le terminal
cd frontend-francais-fluide
ls src/components/admin/AudioUploader.tsx
```

**Résultat attendu** :
```
src/components/admin/AudioUploader.tsx
```

### Vérifier l'Import dans AdminDictations.tsx

```typescript
// Ligne 17 de AdminDictations.tsx
import AudioUploader from './AudioUploader';
```

### Vérifier que le Composant est Utilisé

```typescript
// Lignes 290-314 de AdminDictations.tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Fichier Audio
  </label>
  <AudioUploader
    onUploadSuccess={(audioUrl, duration) => {
      setForm({ 
        ...form, 
        audioUrl, 
        duration: Math.ceil(duration / 60)
      });
    }}
    onUploadError={(error) => {
      alert(`Erreur: ${error}`);
    }}
  />
</div>
```

### Forcer le Rechargement

```bash
# Dans le navigateur
1. Ctrl + Shift + R (rechargement forcé)
2. Ou vider le cache :
   - F12 → Onglet "Application"
   - Storage → Clear site data
```

---

## 📸 À Quoi Devrait Ressembler l'Interface

### Section Upload Audio (Attendu)

```
┌─────────────────────────────────────────┐
│ Fichier Audio                           │
├─────────────────────────────────────────┤
│                                         │
│         🎵                              │
│                                         │
│   Glissez-déposez un fichier audio     │
│              ici, ou                    │
│                                         │
│      [Choisir un fichier]               │
│                                         │
│  Formats acceptés : MP3, WAV, OGG       │
│         (max 10MB)                      │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Ou saisir une URL audio manuellement   │
├─────────────────────────────────────────┤
│ https://exemple.com/audio.mp3          │
└─────────────────────────────────────────┘
```

### Après Upload (Attendu)

```
┌─────────────────────────────────────────┐
│ Fichier Audio                           │
├─────────────────────────────────────────┤
│ 🎵 ma-dictee.mp3                       │
│ 2.45 MB • 2:30                         │
│                                         │
│ ▶️ [Barre de lecture audio]            │
│                                         │
│ [Téléversement en cours... 75%]        │
└─────────────────────────────────────────┘

✅ Audio téléversé : /audio/dictations/ma-dictee-123.mp3
```

---

## ✅ Checklist de Vérification

- [ ] Page Admin → Dictées accessible
- [ ] Bouton "Nouvelle dictée" visible
- [ ] Formulaire s'affiche au clic
- [ ] Section "Fichier Audio" visible
- [ ] Zone de drag & drop visible
- [ ] Bouton "Choisir un fichier" visible
- [ ] Section "URL manuellement" visible
- [ ] Pas d'erreur dans la console (F12)

---

## 🆘 Si Rien ne Fonctionne

### Contactez-moi avec ces Informations

```
1. Capture d'écran du formulaire
2. Console du navigateur (F12 → Console)
3. Onglet Network (F12 → Network)
4. Version du navigateur
5. Système d'exploitation
```

### Informations à Fournir

```javascript
// Dans la console du navigateur
console.log('Location:', window.location.href);
console.log('Sections:', document.querySelectorAll('.space-y-2').length);
console.log('AudioUploader:', document.querySelector('[class*="audio"]'));
console.log('Errors:', performance.getEntriesByType('navigation'));
```

---

## 📞 Support

Si le problème persiste, vérifiez :
1. ✅ Le serveur frontend tourne (`npm run dev`)
2. ✅ Pas d'erreur de compilation
3. ✅ Le fichier `AudioUploader.tsx` existe
4. ✅ L'import est correct dans `AdminDictations.tsx`

---

**En attendant, utilisez la méthode URL manuelle pour uploader vos audios !** 🎙️
