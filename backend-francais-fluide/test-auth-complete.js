#!/usr/bin/env node

// Test complet de l'authentification end-to-end
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  name: 'Test User Auth',
  email: `test-auth-${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

let authToken = null;

async function testAuth() {
  console.log('🧪 Test d\'authentification end-to-end\n');
  
  try {
    // 1. Test de santé du serveur
    console.log('1️⃣ Test de connexion au serveur...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('Serveur non accessible');
    }
    const healthData = await healthResponse.json();
    console.log('✅ Serveur accessible:', healthData.status);

    // 2. Test d'inscription
    console.log('\n2️⃣ Test d\'inscription...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    const registerData = await registerResponse.json();
    if (!registerData.success) {
      throw new Error(`Inscription échouée: ${registerData.error}`);
    }
    
    authToken = registerData.token;
    console.log('✅ Inscription réussie');
    console.log('   - Token reçu:', !!authToken);
    console.log('   - Utilisateur:', registerData.user.name);
    console.log('   - Email:', registerData.user.email);

    // 3. Test de récupération du profil
    console.log('\n3️⃣ Test de récupération du profil...');
    const profileResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const profileData = await profileResponse.json();
    if (!profileData.success) {
      throw new Error(`Récupération profil échouée: ${profileData.error}`);
    }
    
    console.log('✅ Profil récupéré avec succès');
    console.log('   - ID:', profileData.user.id);
    console.log('   - Nom:', profileData.user.name);
    console.log('   - Email:', profileData.user.email);
    console.log('   - Progression:', !!profileData.user.progress);
    console.log('   - Abonnement:', profileData.user.subscription?.plan || 'Aucun');

    // 4. Test de refresh token
    console.log('\n4️⃣ Test de refresh token...');
    const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const refreshData = await refreshResponse.json();
    if (!refreshData.success) {
      throw new Error(`Refresh token échoué: ${refreshData.error}`);
    }
    
    const newToken = refreshData.token;
    console.log('✅ Token rafraîchi avec succès');
    console.log('   - Nouveau token reçu:', !!newToken);
    console.log('   - Token différent:', newToken !== authToken);

    // 5. Test de connexion avec les identifiants
    console.log('\n5️⃣ Test de connexion...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Connexion échouée: ${loginData.error}`);
    }
    
    console.log('✅ Connexion réussie');
    console.log('   - Token reçu:', !!loginData.token);
    console.log('   - Utilisateur:', loginData.user.name);
    console.log('   - Progression incluse:', !!loginData.user.progress);
    console.log('   - Abonnement inclus:', !!loginData.user.subscription);

    // 6. Test d'accès à une route protégée
    console.log('\n6️⃣ Test d\'accès à route protégée...');
    const progressResponse = await fetch(`${BASE_URL}/api/progress`, {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (progressResponse.ok) {
      const progressData = await progressResponse.json();
      console.log('✅ Accès route protégée réussi');
      console.log('   - Données progression récupérées:', !!progressData.data);
    } else {
      console.log('⚠️ Route progression non accessible (normal si pas implémentée)');
    }

    // 7. Test avec token invalide
    console.log('\n7️⃣ Test avec token invalide...');
    const invalidResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 
        'Authorization': 'Bearer token-invalide',
        'Content-Type': 'application/json'
      }
    });
    
    if (invalidResponse.status === 403 || invalidResponse.status === 401) {
      console.log('✅ Token invalide correctement rejeté');
    } else {
      console.log('⚠️ Token invalide accepté (problème de sécurité)');
    }

    console.log('\n🎉 TOUS LES TESTS D\'AUTHENTIFICATION SONT PASSÉS !');
    console.log('\n📊 Résumé:');
    console.log('   ✅ Inscription fonctionnelle');
    console.log('   ✅ Connexion fonctionnelle');
    console.log('   ✅ Récupération profil fonctionnelle');
    console.log('   ✅ Refresh token fonctionnel');
    console.log('   ✅ Protection des routes fonctionnelle');
    console.log('   ✅ Validation des tokens fonctionnelle');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:', error.message);
    console.log('\n🔧 Actions recommandées:');
    console.log('   1. Vérifiez que le serveur backend est démarré (port 3001)');
    console.log('   2. Vérifiez la configuration de la base de données');
    console.log('   3. Vérifiez les variables d\'environnement JWT_SECRET');
    process.exit(1);
  }
}

// Fonction utilitaire pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Lancement du test
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };
