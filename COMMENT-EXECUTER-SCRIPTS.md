# 📝 Comment Exécuter les Scripts

## 🎯 Problème
Vous êtes dans le mauvais dossier. Le script est à la **racine du projet**, pas dans `frontend-francais-fluide`.

## ✅ Solution

### Méthode 1 : Via l'Explorateur Windows (Le Plus Simple)

1. **Ouvrez l'Explorateur Windows**
2. **Naviguez vers** :
   ```
   C:\Users\Cherif\OneDrive\Desktop\burreauDossiers\laboratoire\github\francais-fluide
   ```
3. **Trouvez le fichier** : `fix-vercel-complet.ps1`
4. **Clic droit** sur le fichier
5. **Sélectionnez** : "Exécuter avec PowerShell"

### Méthode 2 : Via Terminal (Depuis le Bon Dossier)

#### Dans PowerShell ou Terminal VS Code

```powershell
# 1. Retourner au dossier racine
cd ..

# Vous devriez être maintenant dans :
# C:\Users\Cherif\OneDrive\Desktop\burreauDossiers\laboratoire\github\francais-fluide

# 2. Vérifier que le script existe
ls fix-vercel-complet.ps1

# 3. Exécuter le script
.\fix-vercel-complet.ps1
```

#### Si Vous Avez une Erreur de Politique d'Exécution

```powershell
# Autoriser l'exécution pour cette session uniquement
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Puis exécuter le script
.\fix-vercel-complet.ps1
```

### Méthode 3 : Script .BAT (Alternative Plus Simple)

Si PowerShell pose problème, utilisez le script `.bat` à la place :

```cmd
# 1. Retourner au dossier racine
cd ..

# 2. Exécuter le script BAT
.\force-redeploy.bat
```

Le fichier `.bat` est plus simple et ne nécessite pas de permissions spéciales.

## 📂 Structure des Dossiers

```
francais-fluide/                          ← VOUS DEVEZ ÊTRE ICI
├── fix-vercel-complet.ps1               ← Le script PowerShell
├── force-redeploy.bat                   ← Le script BAT (alternative)
├── frontend-francais-fluide/            ← Vous étiez ici (mauvais dossier)
│   └── ...
└── backend-francais-fluide/
    └── ...
```

## 🔧 Commandes Complètes

### Depuis `frontend-francais-fluide` (où vous êtes)

```powershell
# Retourner au dossier parent
cd ..

# Vérifier que vous êtes au bon endroit
pwd
# Devrait afficher : C:\Users\Cherif\OneDrive\Desktop\burreauDossiers\laboratoire\github\francais-fluide

# Lister les scripts disponibles
ls *.ps1
ls *.bat

# Exécuter le script PowerShell
.\fix-vercel-complet.ps1

# OU exécuter le script BAT (plus simple)
.\force-redeploy.bat
```

## 🚨 Erreurs Courantes

### Erreur 1 : "Le terme n'est pas reconnu"
**Cause** : Vous êtes dans le mauvais dossier
**Solution** : `cd ..` pour remonter d'un niveau

### Erreur 2 : "Impossible de charger le fichier car l'exécution de scripts est désactivée"
**Cause** : Politique d'exécution PowerShell
**Solution** :
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\fix-vercel-complet.ps1
```

### Erreur 3 : "Accès refusé"
**Cause** : Permissions insuffisantes
**Solution** : Clic droit sur PowerShell → "Exécuter en tant qu'administrateur"

## 💡 Recommandation

**Utilisez le script `.bat` qui est plus simple** :

1. Retournez au dossier racine : `cd ..`
2. Double-cliquez sur `force-redeploy.bat` dans l'Explorateur
3. OU exécutez : `.\force-redeploy.bat` dans le terminal

Le script `.bat` fait la même chose mais sans les problèmes de permissions PowerShell.

## 📋 Checklist

- [ ] Je suis dans le bon dossier (racine du projet)
- [ ] Le script existe (vérifier avec `ls`)
- [ ] J'ai les permissions d'exécution
- [ ] Le script s'exécute sans erreur

---

**Astuce** : Ajoutez un favori dans l'Explorateur Windows vers le dossier racine du projet pour y accéder rapidement !
