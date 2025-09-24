// scripts/test-connection.mjs
// Script simple pour tester la connexion au serveur

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🔍 TEST DE CONNEXION SERVEUR');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Backend Health Check
    console.log('\n🧪 Test: Backend Health Check');
    console.log(`   URL: ${BACKEND_URL}/health`);
    
    const backendResponse = await fetch(`${BACKEND_URL}/health`);
    if (backendResponse.ok) {
      const data = await backendResponse.json();
      console.log('   ✅ Backend accessible');
      console.log('   📊 Status:', data.status);
      console.log('   🕒 Uptime:', data.uptime, 'seconds');
    } else {
      console.log('   ❌ Backend inaccessible');
      console.log('   📝 Status:', backendResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion backend');
    console.log('   📝 Erreur:', error.message);
  }

  try {
    // Test 2: Backend API Info
    console.log('\n🧪 Test: Backend API Info');
    console.log(`   URL: ${BACKEND_URL}/api`);
    
    const apiResponse = await fetch(`${BACKEND_URL}/api`);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('   ✅ API accessible');
      console.log('   📊 Nom:', data.name);
      console.log('   🔗 Endpoints disponibles:', Object.keys(data.endpoints).length);
    } else {
      console.log('   ❌ API inaccessible');
      console.log('   📝 Status:', apiResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion API');
    console.log('   📝 Erreur:', error.message);
  }

  try {
    // Test 3: Test avec authentification (utilisateur de test)
    console.log('\n🧪 Test: Authentification');
    console.log(`   URL: ${BACKEND_URL}/api/auth/login`);
    
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@francais-fluide.com',
        password: 'Test!1234'
      })
    });
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('   ✅ Authentification réussie');
      console.log('   👤 Utilisateur:', data.user?.name);
      console.log('   🔑 Token reçu:', data.token ? 'Oui' : 'Non');
      
      // Test 4: API Progression avec token
      if (data.token) {
        console.log('\n🧪 Test: API Progression');
        console.log(`   URL: ${BACKEND_URL}/api/progress`);
        
        const progressResponse = await fetch(`${BACKEND_URL}/api/progress`, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          console.log('   ✅ API Progression accessible');
          console.log('   📊 Mots écrits:', progressData.data?.wordsWritten);
          console.log('   🎯 Précision:', progressData.data?.accuracy + '%');
          console.log('   📈 Niveau:', progressData.data?.level);
        } else {
          console.log('   ❌ API Progression inaccessible');
          console.log('   📝 Status:', progressResponse.status);
          const errorData = await progressResponse.json().catch(() => ({}));
          console.log('   📝 Erreur:', errorData.error || 'Erreur inconnue');
        }
      }
    } else {
      console.log('   ❌ Échec de l\'authentification');
      console.log('   📝 Status:', loginResponse.status);
      const errorData = await loginResponse.json().catch(() => ({}));
      console.log('   📝 Erreur:', errorData.error || 'Erreur inconnue');
    }
  } catch (error) {
    console.log('   ❌ Erreur lors du test d\'authentification');
    console.log('   📝 Erreur:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test de connexion terminé');
}

// Exécuter le test
testConnection().catch(console.error);
