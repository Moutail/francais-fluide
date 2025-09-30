// setup.js - Script de configuration automatique
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration automatique de FrançaisFluide...\n');

// Créer le fichier .env.local
const envContent = `# Configuration automatique - FrançaisFluide
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/francais_fluide"

# JWT Secret (CHANGEZ CELUI-CI EN PRODUCTION !)
JWT_SECRET="mon-secret-jwt-super-securise-${Date.now()}"

# APIs IA (optionnel)
OPENAI_API_KEY="sk-votre-cle-openai"
ANTHROPIC_API_KEY="sk-ant-votre-cle-anthropic"

# Stripe (optionnel)
STRIPE_SECRET_KEY="sk_test_votre-cle-stripe"
STRIPE_PUBLISHABLE_KEY="pk_test_votre-cle-stripe"
`;

const envPath = path.join(__dirname, '.env.local');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env.local créé');
  } else {
    console.log('⚠️  Fichier .env.local existe déjà');
  }
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env.local:', error.message);
}

// Vérifier les dépendances
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  console.log('\n📦 Dépendances installées :');
  const requiredDeps = ['@prisma/client', 'prisma', 'bcryptjs', 'jsonwebtoken'];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - MANQUANT`);
    }
  });
}

console.log('\n🎯 Prochaines étapes :');
console.log('1. Éditez .env.local avec vos vraies valeurs');
console.log('2. Exécutez : npx prisma generate');
console.log('3. Exécutez : npx prisma db push');
console.log('4. Exécutez : npm run dev');
console.log('\n🚀 Votre application sera prête !');
