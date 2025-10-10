# 🔑 Guide de Configuration des Clés API

Date : 10 octobre 2025

---

## 📋 Étape par Étape

### 1. Ouvrir le Fichier `.env`

```
c:\Users\Cherif\OneDrive\Desktop\burreauDossiers\laboratoire\github\francais-fluide\backend-francais-fluide\.env
```

### 2. Format Correct du Fichier `.env`

**IMPORTANT** : Chaque clé doit être sur **UNE SEULE LIGNE**, sans retour à la ligne.

```env
# Configuration de la base de données
DATABASE_URL=postgresql://user:password@localhost:5432/francais_fluide

# Configuration JWT
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRES_IN=7d

# Configuration IA
AI_PROVIDER=anthropic

# Clé Anthropic (Claude) - TOUT SUR UNE LIGNE
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_COMPLETE_ICI_SANS_RETOUR_A_LA_LIGNE

# Clé OpenAI (GPT) - TOUT SUR UNE LIGNE
OPENAI_API_KEY=sk-proj-VOTRE_CLE_COMPLETE_ICI_SANS_RETOUR_A_LA_LIGNE

# Autres configurations
LANGUAGE_TOOL_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
```

---

## ✅ Vérification de Votre Clé Anthropic

### Votre Clé Doit Ressembler à Ceci

```
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
```

**Caractéristiques** :
- ✅ Commence par `sk-ant-api03-`
- ✅ Longueur : ~108-118 caractères
- ✅ Contient des lettres, chiffres, tirets et underscores
- ✅ **TOUT SUR UNE SEULE LIGNE**

---

## 🔧 Comment Corriger Votre `.env`

### Problème Courant : Clé sur Plusieurs Lignes

**❌ INCORRECT** :
```env
ANTHROPIC_API_KEY=sk-ant-api03-C3CHqnMqvENo1-xExRgFhnt7pvggDDFOM_YwykS4DvtcsobZrGOpplVoZd1F-
LfMMwHED5ol5mEO13zPJ9j-uw-KgHBhwAA
```

**✅ CORRECT** :
```env
ANTHROPIC_API_KEY=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
```

### Étapes de Correction

1. **Ouvrir `.env` dans VS Code**
2. **Trouver la ligne `ANTHROPIC_API_KEY=`**
3. **Vérifier qu'il n'y a PAS de retour à la ligne dans la clé**
4. **Si la clé est coupée** :
   - Supprimer le retour à la ligne
   - Mettre toute la clé sur une seule ligne
5. **Sauvegarder** (Ctrl + S)

---

## 🧪 Test de Votre Configuration

### Méthode 1 : Script de Test

```bash
cd backend-francais-fluide
node test-anthropic-only.js
```

**Résultat attendu** :
```
✅ Clé Anthropic trouvée
   Préfixe : sk-ant-api03-C3CHqn...
   Longueur : 118 caractères

📡 Test 1 : Connexion à l'API...
✅ Connexion réussie !

📊 Détails de la réponse :
   Modèle : claude-3-haiku-20240307
   Réponse : "Bonjour !"
   Tokens : 15

🎉 Votre clé Anthropic fonctionne parfaitement !
```

### Méthode 2 : Vérification Manuelle

Dans PowerShell :
```powershell
cd backend-francais-fluide
Get-Content .env | Select-String "ANTHROPIC_API_KEY"
```

**Vérifiez** :
- ✅ La ligne est complète
- ✅ Pas de retour à la ligne
- ✅ La clé commence par `sk-ant-api03-`

---

## 💡 Configuration OpenAI (Optionnel)

### Si Vous Avez Aussi OpenAI

Je vois que vous configurez un paiement OpenAI. Une fois configuré :

1. **Allez sur** : https://platform.openai.com/api-keys
2. **Créez une nouvelle clé** : "Create new secret key"
3. **Copiez la clé complète** (commence par `sk-proj-...`)
4. **Ajoutez dans `.env`** :

```env
OPENAI_API_KEY=sk-proj-VOTRE_CLE_COMPLETE_ICI
```

**IMPORTANT** : La clé OpenAI aussi doit être sur **UNE SEULE LIGNE**.

---

## 🎯 Exemple de `.env` Complet

```env
# Base de données
DATABASE_URL=postgresql://postgres:password@localhost:5432/francais_fluide

# JWT
JWT_SECRET=mon_secret_super_securise_123
JWT_EXPIRES_IN=7d

# IA Provider (choisir entre 'openai' ou 'anthropic')
AI_PROVIDER=anthropic

# Anthropic Claude
ANTHROPIC_API_KEY=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

# OpenAI GPT (optionnel)
OPENAI_API_KEY=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

# Autres
LANGUAGE_TOOL_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## ⚠️ Erreurs Courantes

### Erreur 1 : "ANTHROPIC_API_KEY non trouvée"

**Cause** : La clé n'est pas dans le fichier ou mal formatée

**Solution** :
1. Vérifiez que la ligne existe
2. Vérifiez qu'elle commence par `ANTHROPIC_API_KEY=`
3. Vérifiez qu'il n'y a pas d'espace avant ou après le `=`
4. Vérifiez que la clé est sur une seule ligne

### Erreur 2 : "Incorrect API key"

**Cause** : La clé est invalide, expirée ou incomplète

**Solution** :
1. Allez sur https://console.anthropic.com/settings/keys
2. Vérifiez que la clé existe et est active
3. Créez une nouvelle clé si nécessaire
4. Copiez la clé **complète** (toute la ligne)
5. Remplacez dans `.env`

### Erreur 3 : Clé coupée

**Cause** : Retour à la ligne dans la clé

**Solution** :
1. Ouvrez `.env` dans VS Code
2. Désactivez le "word wrap" (Alt + Z)
3. Vérifiez que la clé est sur une seule ligne
4. Si elle est coupée, supprimez le retour à la ligne
5. Sauvegardez

---

## 🚀 Après Configuration

### 1. Redémarrer le Backend

```bash
cd backend-francais-fluide
npm run dev
```

### 2. Tester la Génération

Dans l'application :
1. Se connecter
2. Aller dans "Exercices"
3. Cliquer sur "Générer avec IA"
4. Choisir un type d'exercice
5. Générer

### 3. Vérifier les Logs

Dans la console du backend, vous devriez voir :
```
✅ Anthropic API connectée
🤖 Génération d'exercice avec claude-3-haiku...
✅ Exercice généré avec succès
```

---

## 📊 Surveillance des Crédits

### Anthropic Console

- **URL** : https://console.anthropic.com/settings/billing
- **Solde actuel** : 5,00 $US
- **Expiration** : 24 septembre 2026

### Recommandations

1. **Vérifiez votre solde** régulièrement
2. **Configurez des alertes** à 80% et 90%
3. **Utilisez Haiku** pour économiser
4. **Réutilisez les exercices** générés

---

## ✅ Checklist Finale

- [ ] Fichier `.env` existe
- [ ] `ANTHROPIC_API_KEY` est définie
- [ ] Clé sur **UNE SEULE LIGNE**
- [ ] Clé commence par `sk-ant-api03-`
- [ ] Pas d'espace avant/après le `=`
- [ ] Fichier sauvegardé
- [ ] Test avec `node test-anthropic-only.js`
- [ ] Backend redémarré
- [ ] Génération testée dans l'app

---

**Une fois configuré correctement, testez avec `node test-anthropic-only.js` !** 🚀
