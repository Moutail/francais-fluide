#!/usr/bin/env node

// Script principal pour lancer tous les tests de diagnostic
const { testDatabase } = require('./test-database');
const { testAuth } = require('./test-auth-complete');

async function runAllTests() {
  console.log('🚀 DIAGNOSTIC COMPLET - FRANÇAISFLUIDE BACKEND');
  console.log('================================================\n');
  
  try {
    // 1. Test de la base de données
    await testDatabase();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Test de l'authentification
    await testAuth();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DIAGNOSTIC COMPLET TERMINÉ AVEC SUCCÈS !');
    console.log('✅ Base de données: OK');
    console.log('✅ Authentification: OK');
    console.log('✅ API: OK');
    console.log('\n🚀 Votre backend est prêt à être utilisé !');
    
  } catch (error) {
    console.error('\n❌ ÉCHEC DU DIAGNOSTIC:', error.message);
    console.log('\n🔧 Veuillez corriger les erreurs avant de continuer.');
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}
