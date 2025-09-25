# 🔒 Guide de Sécurité - FrançaisFluide Backend

## Vue d'ensemble des mesures de sécurité implémentées

### 🛡️ **Authentification & Autorisation**

#### JWT (JSON Web Tokens)
- **Durée de vie**: 7 jours
- **Algorithme**: HS256
- **Refresh automatique**: Toutes les 30 minutes
- **Validation**: Vérification de signature et expiration

#### Protection des mots de passe
- **Hachage**: bcrypt avec salt de 12 rounds
- **Politique**: 8+ caractères, majuscule, minuscule, chiffre, caractère spécial
- **Prévention**: Attaques par dictionnaire et force brute

### 🚫 **Rate Limiting Intelligent**

#### Configuration par type de route
```javascript
// Authentification: 5 tentatives / 15 min (prod)
// Opérations IA: 10 requêtes / minute (prod)
// Créations: 20 créations / minute (prod)
// Général: 100 requêtes / 15 min (prod)
```

#### Fonctionnalités avancées
- **Rate limiting adaptatif** selon l'utilisateur connecté
- **Blocage temporaire** après tentatives échouées
- **Whitelist automatique** en développement
- **Logging détaillé** des tentatives suspectes

### 🔍 **Protection contre les Injections**

#### SQL Injection
- **Détection**: Patterns suspects dans les paramètres
- **Prévention**: Requêtes préparées avec Prisma
- **Logging**: Tentatives d'injection enregistrées

#### NoSQL Injection
- **Filtrage**: Opérateurs MongoDB suspects ($where, $regex, etc.)
- **Validation**: Types de données stricte

#### XSS (Cross-Site Scripting)
- **Sanitization**: Suppression des balises script et iframe
- **Échappement**: Caractères HTML dangereux
- **CSP**: Content Security Policy restrictive

### 🛣️ **Protection des Chemins**

#### Path Traversal
- **Détection**: Patterns `../` et chemins système
- **Blocage**: Accès aux fichiers sensibles (/etc/passwd, etc.)
- **Validation**: Tous les paramètres de chemin

### 🔒 **Sécurité des En-têtes**

#### Helmet.js Configuration
```javascript
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
```

#### CORS Sécurisé
- **Origins autorisées**: Liste blanche configurée
- **Credentials**: Gestion sécurisée des cookies
- **Méthodes**: Restriction aux méthodes nécessaires

### 📊 **Monitoring & Détection d'Anomalies**

#### Détection en temps réel
- **Patterns suspects**: User-Agent, comportements anormaux
- **Seuils d'alerte**: Requêtes excessives par endpoint
- **Blocage automatique**: Activité malveillante détectée

#### Logging de sécurité
```javascript
- Tentatives d'authentification échouées
- Injections détectées
- Origines non autorisées
- Activité suspecte
```

### 🔐 **Protection CSRF**

#### Token CSRF
- **Génération**: Tokens uniques par session
- **Validation**: Vérification sur toutes les mutations
- **Expiration**: 30 minutes de durée de vie
- **En-têtes**: X-CSRF-Token requis

### 🛡️ **Validation des Données**

#### Validation stricte
```javascript
- Longueur des chaînes limitée
- Types de données vérifiés
- Patterns regex pour formats spécifiques
- Sanitization automatique
```

#### Échappement automatique
- **HTML**: Caractères dangereux échappés
- **Caractères de contrôle**: Supprimés automatiquement
- **Validation récursive**: Objets imbriqués traités

## 🚨 **Réponse aux Incidents**

### Détection d'Attaque

1. **Logging automatique** de l'incident
2. **Blocage temporaire** de l'IP/utilisateur
3. **Notification** dans les logs
4. **Analyse** des patterns d'attaque

### Types d'Alertes

#### 🔴 Critique
- Tentatives d'injection SQL
- Attaques XSS détectées
- Accès non autorisé aux ressources admin

#### 🟡 Avertissement
- Rate limiting dépassé
- Origines CORS suspectes
- Patterns de bot détectés

#### 🟢 Information
- Nouvelles connexions utilisateur
- Opérations sensibles (admin)

## ⚙️ **Configuration Sécurisée**

### Variables d'Environnement Essentielles

```bash
# Sécurité de base
JWT_SECRET="clé-très-longue-et-aléatoire-256-bits"
NODE_ENV="production"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Requêtes max

# CORS
FRONTEND_URL="https://votre-domaine.com"
ALLOWED_ORIGIN="https://votre-domaine.com"

# Chiffrement (optionnel)
ENCRYPTION_KEY="clé-de-chiffrement-32-bytes"
```

### Recommandations de Déploiement

#### 🔒 HTTPS Obligatoire
```nginx
# Configuration Nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
}
```

#### 🛡️ Firewall
- **Ports ouverts**: Uniquement 80, 443, 22 (SSH)
- **IP Whitelisting**: Admin et services autorisés
- **DDoS Protection**: CloudFlare ou équivalent

#### 📊 Monitoring
- **Logs centralisés**: ELK Stack ou équivalent
- **Alertes automatiques**: Seuils de sécurité
- **Backups chiffrés**: Données sensibles

## 🧪 **Tests de Sécurité**

### Tests Automatisés

```bash
# Lancer les tests de sécurité
npm run test:security

# Tests spécifiques
npm run test:auth      # Authentification
npm run test:injection # Injections
npm run test:xss       # XSS
```

### Audit Régulier

#### Outils Recommandés
- **npm audit**: Vulnérabilités des dépendances
- **Snyk**: Analyse de sécurité continue
- **OWASP ZAP**: Tests de pénétration
- **Helmet**: Scan des en-têtes de sécurité

### Checklist de Sécurité

- [ ] JWT_SECRET configuré et sécurisé
- [ ] HTTPS activé en production
- [ ] Rate limiting configuré
- [ ] CORS restreint aux domaines autorisés
- [ ] Logs de sécurité activés
- [ ] Backups chiffrés et testés
- [ ] Mise à jour des dépendances
- [ ] Tests de sécurité automatisés
- [ ] Monitoring des alertes configuré
- [ ] Plan de réponse aux incidents défini

## 📞 **Contact Sécurité**

En cas d'incident de sécurité :
1. **Immédiat**: Bloquer l'accès si nécessaire
2. **Documentation**: Capturer tous les logs pertinents
3. **Analyse**: Évaluer l'impact et les données compromises
4. **Notification**: Informer les parties prenantes
5. **Correction**: Appliquer les correctifs nécessaires
6. **Post-mortem**: Analyser et améliorer les mesures

---

**Note**: Cette configuration de sécurité est adaptée pour une application en production. En développement, certaines restrictions sont assouplies pour faciliter les tests.
