# 🔒 Sécurité des Clés API - Guide Important

## ⚠️ DANGER : Ne JAMAIS Publier Vos Clés API !

### Pourquoi C'est Dangereux ?

Si vos clés API sont publiées sur GitHub :
- ❌ **N'importe qui peut les utiliser**
- ❌ **Vos crédits seront volés**
- ❌ **Facture énorme** (des milliers de dollars possibles)
- ❌ **Compte suspendu** par OpenAI/Anthropic
- ❌ **Données compromises**

---

## ✅ Bonnes Pratiques

### 1. Fichier `.env` TOUJOURS dans `.gitignore`

Le fichier `.env` contient vos secrets et **NE DOIT JAMAIS** être commit.

**Vérifiez** :
```bash
# Vérifier que .env est ignoré
git check-ignore .env
# Doit afficher : .env
```

### 2. Utiliser `.env.example` pour la Documentation

Créez un fichier `.env.example` **SANS** les vraies clés :

```env
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=votre_secret_ici
OPENAI_API_KEY=sk-proj-VOTRE_CLE_ICI
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ICI
```

Ce fichier peut être commit car il ne contient **pas** les vraies clés.

### 3. Ne Jamais Mettre de Clés dans le Code

**❌ INCORRECT** :
```javascript
const apiKey = 'sk-proj-abc123...';
```

**✅ CORRECT** :
```javascript
const apiKey = process.env.OPENAI_API_KEY;
```

### 4. Ne Jamais Mettre de Clés dans la Documentation

**❌ INCORRECT** :
```markdown
Votre clé API : sk-proj-abc123...
```

**✅ CORRECT** :
```markdown
Votre clé API : sk-proj-VOTRE_CLE_ICI
```

---

## 🚨 Si Vous Avez Déjà Publié une Clé

### 1. **RÉVOQUER IMMÉDIATEMENT** la Clé

**OpenAI** :
1. Allez sur https://platform.openai.com/api-keys
2. Trouvez la clé compromise
3. Cliquez sur "Revoke"
4. Créez une nouvelle clé

**Anthropic** :
1. Allez sur https://console.anthropic.com/settings/keys
2. Trouvez la clé compromise
3. Supprimez-la
4. Créez une nouvelle clé

### 2. Supprimer la Clé de l'Historique Git

**⚠️ IMPORTANT** : Supprimer un fichier ne suffit pas ! La clé reste dans l'historique Git.

```bash
# Installer BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# Supprimer les clés de l'historique
bfg --replace-text passwords.txt

# Forcer le push
git push --force
```

Ou utilisez GitHub Secret Scanning pour supprimer automatiquement.

### 3. Vérifier les Dégâts

**OpenAI** :
- Allez dans "Usage" : https://platform.openai.com/usage
- Vérifiez s'il y a des requêtes suspectes

**Anthropic** :
- Allez dans "Usage" : https://console.anthropic.com/settings/usage
- Vérifiez la consommation

---

## 🛡️ Protection Automatique

### GitHub Secret Scanning

GitHub détecte automatiquement les clés API et **bloque le push**.

**Si vous voyez cette alerte** :
1. ✅ **Cliquez sur "Bypass"** pour annuler
2. ✅ Nettoyez les fichiers
3. ✅ Ajoutez les fichiers au `.gitignore`
4. ✅ Commit à nouveau

### Fichiers à Ignorer

Ajoutez dans `.gitignore` :
```
# Fichiers avec clés API
.env
.env.*
!.env.example

# Scripts de test
test-*-api.js
create-env.js
verify-env*.js
*-API-*.md
```

---

## ✅ Checklist de Sécurité

Avant chaque commit :

- [ ] `.env` est dans `.gitignore`
- [ ] Aucune clé API dans le code
- [ ] Aucune clé API dans la documentation
- [ ] `.env.example` utilise des placeholders
- [ ] `git status` ne montre pas `.env`
- [ ] Aucun fichier de test avec clés réelles

---

## 📋 Fichiers Sûrs vs Dangereux

### ✅ Sûrs à Commit

- `.env.example` (avec placeholders)
- Code utilisant `process.env.API_KEY`
- Documentation avec `VOTRE_CLE_ICI`
- `.gitignore` avec `.env`

### ❌ Dangereux à Commit

- `.env` (avec vraies clés)
- Code avec clés en dur
- Documentation avec vraies clés
- Scripts de test avec clés
- Fichiers de backup avec clés

---

## 🔧 Configuration Actuelle

### Fichiers Protégés

Votre `.gitignore` protège maintenant :
- `.env`
- `test-final.js`
- `test-api-*.js`
- `create-env.js`
- `verify-env*.js`
- `INSTRUCTIONS-ENV.md`

### Fichiers Nettoyés

Les clés API ont été supprimées de :
- ✅ `RESULTAT-TEST-API.md`
- ✅ `test-final.js` (supprimé)
- ✅ `create-env.js` (supprimé)
- ✅ `INSTRUCTIONS-ENV.md` (supprimé)

---

## 🚀 Workflow Sécurisé

### Pour Développer

1. Créez `.env` localement
2. Ajoutez vos clés
3. **NE COMMIT JAMAIS** `.env`
4. Utilisez `process.env.API_KEY` dans le code

### Pour Partager

1. Créez `.env.example` avec placeholders
2. Documentez comment obtenir les clés
3. Commit `.env.example`
4. Les autres développeurs copient `.env.example` → `.env`

### Pour Déployer

1. Utilisez les variables d'environnement du serveur
2. **NE METTEZ PAS** les clés dans le code
3. Utilisez des secrets (GitHub Secrets, Heroku Config Vars, etc.)

---

## 📚 Ressources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [Anthropic Security](https://docs.anthropic.com/claude/docs/security)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**Protégez toujours vos clés API ! C'est comme protéger votre carte bancaire.** 🔒
