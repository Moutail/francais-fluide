// verify-env.js
// Vérifier que le fichier .env est bien lu par le projet

require('dotenv').config({ path: '.env' });

console.log('\n═══════════════════════════════════════════════════');
console.log('   🔍 Vérification du Fichier .env');
console.log('═══════════════════════════════════════════════════\n');

// Vérifier les variables essentielles
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

checks.forEach(check => {
  if (check.value) {
    if (check.name.includes('API_KEY')) {
      console.log(`✅ ${check.name}: ${check.value.substring(0, 30)}...`);
    } else {
      console.log(`✅ ${check.name}: ${check.value}`);
    }
  } else {
    console.log(`❌ ${check.name}: NON DÉFINIE`);
    if (check.name.includes('API_KEY')) {
      allGood = false;
    }
  }
});

console.log('\n═══════════════════════════════════════════════════');

if (allGood) {
  console.log('   ✅ SUCCÈS : Toutes les clés API sont chargées !');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('🎉 Votre fichier .env est correctement lu par le projet !');
  console.log('✨ Les clés API sont disponibles pour l\'application\n');
  
  console.log('📊 Détails :');
  console.log(`   • OpenAI : ${process.env.OPENAI_API_KEY.length} caractères`);
  console.log(`   • Anthropic : ${process.env.ANTHROPIC_API_KEY.length} caractères`);
  console.log(`   • Provider : ${process.env.AI_PROVIDER || 'openai (par défaut)'}\n`);
  
  console.log('🚀 Prochaines étapes :');
  console.log('   1. Démarrez le backend : npm run dev');
  console.log('   2. Vérifiez les logs au démarrage');
  console.log('   3. Testez la génération d\'exercices dans l\'app\n');
} else {
  console.log('   ⚠️  ATTENTION : Certaines clés API manquent');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('🔧 Vérifiez votre fichier .env :');
  console.log('   • Assurez-vous que les clés sont sur UNE seule ligne');
  console.log('   • Pas d\'espace avant ou après le =');
  console.log('   • Les clés commencent par sk-proj- ou sk-ant-api03-\n');
}
