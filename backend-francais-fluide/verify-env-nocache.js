// verify-env-nocache.js
// Vérification SANS cache - Force le rechargement du .env

// Nettoyer le cache de dotenv
delete require.cache[require.resolve('dotenv')];

// Charger dotenv à nouveau
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Vérifier que le fichier .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n❌ ERREUR : Le fichier .env n\'existe pas !');
  console.log(`   Chemin attendu : ${envPath}\n`);
  process.exit(1);
}

// Afficher le contenu brut du fichier
console.log('\n📄 Contenu brut du fichier .env :');
console.log('═══════════════════════════════════════════════════\n');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n').slice(0, 10); // Premières 10 lignes
lines.forEach((line, i) => {
  if (line.trim() && !line.startsWith('#')) {
    console.log(`Ligne ${i + 1}: ${line}`);
  }
});
console.log('\n═══════════════════════════════════════════════════\n');

// Charger le .env
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log('❌ Erreur lors du chargement du .env :');
  console.log(result.error);
  process.exit(1);
}

console.log('✅ Fichier .env chargé avec succès\n');
console.log('═══════════════════════════════════════════════════');
console.log('   🔍 Variables Chargées');
console.log('═══════════════════════════════════════════════════\n');

// Vérifier les variables
const checks = [
  { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
  { name: 'JWT_SECRET', value: process.env.JWT_SECRET },
  { name: 'PORT', value: process.env.PORT },
  { name: 'NODE_ENV', value: process.env.NODE_ENV },
  { name: 'AI_PROVIDER', value: process.env.AI_PROVIDER },
  { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY },
  { name: 'ANTHROPIC_API_KEY', value: process.env.ANTHROPIC_API_KEY },
];

let allGood = true;
let apiKeysOk = true;

checks.forEach(check => {
  if (check.value) {
    if (check.name.includes('API_KEY')) {
      console.log(`✅ ${check.name}: ${check.value.substring(0, 30)}...`);
    } else {
      console.log(`✅ ${check.name}: ${check.value}`);
    }
  } else {
    console.log(`❌ ${check.name}: NON DÉFINIE`);
    if (check.name.includes('API_KEY') || check.name === 'AI_PROVIDER') {
      apiKeysOk = false;
    }
    allGood = false;
  }
});

console.log('\n═══════════════════════════════════════════════════');

if (apiKeysOk) {
  console.log('   ✅ SUCCÈS : Toutes les clés API sont chargées !');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('🎉 Votre fichier .env fonctionne correctement !');
  console.log('✨ Les clés API sont disponibles\n');
  
  if (process.env.OPENAI_API_KEY && process.env.ANTHROPIC_API_KEY) {
    console.log('📊 Détails :');
    console.log(`   • OpenAI : ${process.env.OPENAI_API_KEY.length} caractères`);
    console.log(`   • Anthropic : ${process.env.ANTHROPIC_API_KEY.length} caractères`);
    console.log(`   • Provider : ${process.env.AI_PROVIDER || 'openai (par défaut)'}\n`);
    
    console.log('🚀 Prochaines étapes :');
    console.log('   1. Testez les API : node test-final.js');
    console.log('   2. Démarrez le backend : npm run dev');
    console.log('   3. Testez la génération dans l\'app\n');
  }
} else {
  console.log('   ⚠️  ATTENTION : Certaines clés API manquent');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('🔧 Actions à faire :');
  console.log('   1. Vérifiez que le fichier .env contient les clés API');
  console.log('   2. Vérifiez qu\'il n\'y a pas de guillemets au début/fin');
  console.log('   3. Vérifiez que chaque clé est sur UNE seule ligne\n');
}
