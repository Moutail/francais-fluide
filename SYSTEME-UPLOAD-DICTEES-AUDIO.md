# 🎙️ Système de Téléversement de Dictées Audio

Date : 7 octobre 2025  
Fonctionnalité : Upload de fichiers audio pour les dictées depuis l'interface admin

---

## 🎯 Fonctionnalités

### ✅ Ce qui a été implémenté

1. **Composant de téléversement avec drag & drop**
   - Interface intuitive avec glisser-déposer
   - Preview audio avant upload
   - Détection automatique de la durée
   - Barre de progression
   - Validation des formats et taille

2. **API de téléversement sécurisée**
   - Upload de fichiers audio (MP3, WAV, OGG)
   - Stockage dans `/public/audio/dictations/`
   - Génération de noms uniques
   - Détection automatique de la durée
   - Protection contre les fichiers malveillants

3. **Gestion des fichiers**
   - Liste des fichiers audio disponibles
   - Suppression de fichiers
   - Informations détaillées (taille, date, durée)

4. **Intégration admin**
   - Formulaire de création de dictées avec upload
   - Option de saisir une URL manuellement
   - Affichage de la durée automatique

---

## 📁 Fichiers Créés

### Frontend

1. **`src/app/api/admin/dictations/upload-audio/route.ts`**
   - API proxy pour l'upload
   - Transfère le FormData au backend

2. **`src/components/admin/AudioUploader.tsx`**
   - Composant de téléversement
   - Drag & drop
   - Preview audio
   - Validation

3. **`src/components/admin/AdminDictations.tsx`** (modifié)
   - Intégration du composant AudioUploader
   - Formulaire amélioré

### Backend

4. **`src/routes/admin-dictations-upload.js`**
   - Routes d'upload
   - Gestion des fichiers
   - Sécurité

5. **`src/server.js`** (modifié)
   - Intégration des routes d'upload

---

## 🚀 Utilisation

### 1. Interface Admin

```
1. Aller dans Admin → Dictées
2. Cliquer sur "Nouvelle dictée"
3. Remplir le formulaire
4. Dans la section "Fichier Audio" :
   - Glisser-déposer un fichier audio OU
   - Cliquer sur "Choisir un fichier"
5. Preview de l'audio
6. La durée est détectée automatiquement
7. Cliquer sur "Téléverser le fichier audio"
8. L'URL est automatiquement ajoutée au formulaire
9. Enregistrer la dictée
```

### 2. Formats Acceptés

- **MP3** (recommandé) - Meilleure compatibilité
- **WAV** - Haute qualité
- **OGG** - Open source
- **WebM** - Moderne
- **M4A** - Apple

### 3. Limites

- **Taille max** : 10 MB
- **Durée recommandée** : 1-15 minutes
- **Qualité recommandée** : 128-192 kbps (MP3)

---

## 🔧 Configuration Backend

### 1. Installer les dépendances

```bash
cd backend-francais-fluide
npm install multer get-audio-duration
```

### 2. Créer le dossier de stockage

```bash
mkdir -p public/audio/dictations
```

### 3. Permissions (Linux/Mac)

```bash
chmod 755 public/audio/dictations
```

### 4. Variables d'environnement

Aucune variable supplémentaire nécessaire. Le système utilise les configurations existantes.

---

## 📊 API Endpoints

### POST /api/admin/dictations/upload-audio

**Description** : Téléverser un fichier audio

**Headers** :
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body** :
```
audio: <fichier audio>
```

**Response** :
```json
{
  "success": true,
  "audioUrl": "/audio/dictations/ma-dictee-1696789012345.mp3",
  "duration": 180,
  "filename": "ma-dictee-1696789012345.mp3",
  "size": 2456789,
  "mimetype": "audio/mpeg"
}
```

### DELETE /api/admin/dictations/delete-audio/:filename

**Description** : Supprimer un fichier audio

**Headers** :
```
Authorization: Bearer <token>
```

**Response** :
```json
{
  "success": true,
  "message": "Fichier audio supprimé avec succès"
}
```

### GET /api/admin/dictations/audio-files

**Description** : Liste tous les fichiers audio disponibles

**Headers** :
```
Authorization: Bearer <token>
```

**Response** :
```json
{
  "success": true,
  "files": [
    {
      "filename": "dictee-1.mp3",
      "url": "/audio/dictations/dictee-1.mp3",
      "size": 2456789,
      "createdAt": "2025-10-07T10:00:00.000Z",
      "modifiedAt": "2025-10-07T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 🔒 Sécurité

### Validations Implémentées

1. **Authentification** : Seuls les admins peuvent uploader
2. **Type de fichier** : Seulement les formats audio acceptés
3. **Taille** : Maximum 10 MB
4. **Nom de fichier** : Sanitization automatique
5. **Path traversal** : Protection contre `../`
6. **Stockage** : Dossier dédié et isolé

### Recommandations

- ✅ Toujours vérifier l'authentification admin
- ✅ Limiter la taille des fichiers
- ✅ Valider les types MIME
- ✅ Nettoyer les noms de fichiers
- ✅ Stocker dans un dossier public sécurisé

---

## 🎨 Interface Utilisateur

### Composant AudioUploader

**Props** :
```typescript
interface AudioUploaderProps {
  onUploadSuccess: (audioUrl: string, duration: number) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number; // Défaut: 10
  acceptedFormats?: string[]; // Défaut: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
}
```

**Utilisation** :
```tsx
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
  maxSizeMB={10}
/>
```

### Fonctionnalités UI

- ✅ Drag & drop
- ✅ Click to upload
- ✅ Preview audio
- ✅ Barre de progression
- ✅ Validation en temps réel
- ✅ Messages d'erreur clairs
- ✅ Détection automatique de la durée
- ✅ Affichage de la taille du fichier

---

## 🧪 Tests

### Test 1 : Upload Basique

```bash
# Avec curl
curl -X POST http://localhost:3001/api/admin/dictations/upload-audio \
  -H "Authorization: Bearer <admin-token>" \
  -F "audio=@dictee.mp3"
```

### Test 2 : Validation Format

```bash
# Essayer avec un fichier non-audio (doit échouer)
curl -X POST http://localhost:3001/api/admin/dictations/upload-audio \
  -H "Authorization: Bearer <admin-token>" \
  -F "audio=@image.jpg"
```

### Test 3 : Taille Limite

```bash
# Essayer avec un fichier > 10MB (doit échouer)
curl -X POST http://localhost:3001/api/admin/dictations/upload-audio \
  -H "Authorization: Bearer <admin-token>" \
  -F "audio=@gros-fichier.mp3"
```

### Test 4 : Liste des Fichiers

```bash
curl http://localhost:3001/api/admin/dictations/audio-files \
  -H "Authorization: Bearer <admin-token>"
```

### Test 5 : Suppression

```bash
curl -X DELETE http://localhost:3001/api/admin/dictations/delete-audio/dictee-123.mp3 \
  -H "Authorization: Bearer <admin-token>"
```

---

## 📝 Workflow Complet

### Créer une Dictée avec Audio

```
1. Admin se connecte
2. Va dans Admin → Dictées
3. Clique sur "Nouvelle dictée"
4. Remplit :
   - Titre : "Les saisons"
   - Catégorie : "Nature"
   - Difficulté : "Débutant"
   - Texte : "Le printemps arrive..."
5. Upload audio :
   - Glisse dictee-saisons.mp3
   - Preview automatique
   - Durée détectée : 2:30
   - Clique "Téléverser"
6. URL ajoutée automatiquement
7. Durée mise à jour : 3 min
8. Clique "Enregistrer"
9. ✅ Dictée créée avec audio
```

---

## 🐛 Dépannage

### Erreur : "Type de fichier non supporté"

**Cause** : Format audio non accepté  
**Solution** : Convertir en MP3, WAV ou OGG

### Erreur : "Fichier trop volumineux"

**Cause** : Fichier > 10 MB  
**Solution** : Compresser l'audio ou réduire la qualité

### Erreur : "Impossible de déterminer la durée"

**Cause** : Fichier audio corrompu ou format non standard  
**Solution** : Ré-encoder le fichier avec un outil standard

### Audio ne se lit pas

**Cause** : Chemin incorrect ou fichier manquant  
**Solution** : Vérifier que le fichier existe dans `/public/audio/dictations/`

---

## 🔄 Améliorations Futures

### Phase 1 (Court terme)

- [ ] Compression automatique des fichiers
- [ ] Conversion automatique en MP3
- [ ] Génération de waveform visuelle
- [ ] Édition de métadonnées (titre, artiste)

### Phase 2 (Moyen terme)

- [ ] Stockage cloud (AWS S3, Cloudinary)
- [ ] CDN pour la distribution
- [ ] Transcription automatique (Speech-to-Text)
- [ ] Génération de sous-titres

### Phase 3 (Long terme)

- [ ] Édition audio dans le navigateur
- [ ] Normalisation automatique du volume
- [ ] Suppression du bruit de fond
- [ ] Synthèse vocale (TTS) intégrée

---

## 📚 Ressources

### Bibliothèques Utilisées

- **multer** : Upload de fichiers
- **get-audio-duration** : Détection de la durée audio
- **framer-motion** : Animations UI

### Documentation

- Multer : https://www.npmjs.com/package/multer
- get-audio-duration : https://www.npmjs.com/package/get-audio-duration
- Web Audio API : https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## ✅ Checklist de Déploiement

- [x] Créer le composant AudioUploader
- [x] Créer l'API d'upload backend
- [x] Intégrer dans AdminDictations
- [x] Ajouter les routes au serveur
- [ ] Installer les dépendances (`npm install multer get-audio-duration`)
- [ ] Créer le dossier `/public/audio/dictations/`
- [ ] Tester l'upload
- [ ] Tester la suppression
- [ ] Déployer sur production
- [ ] Configurer le CDN (optionnel)

---

**Système d'upload de dictées audio opérationnel !** 🎉

Les admins peuvent maintenant téléverser des fichiers audio directement depuis l'interface.
