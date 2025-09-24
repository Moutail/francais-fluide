// scripts/test-server-connection.js
// Script pour tester la connexion au serveur backend

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function testServerConnection() {
  console.log('🔍 TEST DE CONNEXION SERVEUR');
  console.log('='.repeat(50));
  
  const tests = [
    {
      name: 'Backend Health Check',
      url: `${BACKEND_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Backend API Info',
      url: `${BACKEND_URL}/api`,
      method: 'GET'
    },
    {
      name: 'Frontend Health Check',
      url: `${FRONTEND_URL}/api/health`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Test: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Succès (${response.status})`);
        console.log(`   📊 Données:`, JSON.stringify(data, null, 2));
      } else {
        console.log(`   ❌ Erreur (${response.status})`);
        const errorText = await response.text();
        console.log(`   📝 Erreur:`, errorText);
      }
    } catch (error) {
      console.log(`   ❌ Échec de connexion`);
      console.log(`   📝 Erreur:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Test de connexion terminé');
}

// Test avec authentification
async function testAuthenticatedEndpoints() {
  console.log('\n🔐 TEST DES ENDPOINTS AUTHENTIFIÉS');
  console.log('='.repeat(50));
  
  // Note: Ce test nécessiterait un token valide
  console.log('ℹ️  Pour tester les endpoints authentifiés, vous devez:');
  console.log('   1. Créer un compte via /api/auth/register');
  console.log('   2. Se connecter via /api/auth/login');
  console.log('   3. Utiliser le token reçu pour les requêtes authentifiées');
}

// Fonction principale
async function runAllTests() {
  try {
    await testServerConnection();
    await testAuthenticatedEndpoints();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testServerConnection,
  testAuthenticatedEndpoints,
  runAllTests
};
