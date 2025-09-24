// scripts/test-frontend-login.mjs
// Script pour tester la connexion complète depuis le frontend

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

async function testFrontendLogin() {
  console.log('🔍 TEST CONNEXION FRONTEND');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Vérifier que le frontend est accessible
    console.log('\n🧪 Test 1: Accessibilité du frontend');
    const frontendResponse = await fetch(FRONTEND_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend accessible');
    } else {
      console.log('❌ Frontend inaccessible');
      return;
    }
    
    // Test 2: Connexion via l'API backend
    console.log('\n🧪 Test 2: Connexion via API backend');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'etudiant@test.com',
        password: 'Test!1234'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Échec de l\'authentification');
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Authentification réussie');
    console.log('👤 Utilisateur:', loginData.user?.name);
    console.log('🔑 Token reçu:', loginData.token ? 'Oui' : 'Non');
    
    // Test 3: Simuler le stockage du token
    console.log('\n🧪 Test 3: Simulation du stockage du token');
    if (loginData.token) {
      // Simuler localStorage.setItem('token', token)
      console.log('✅ Token prêt à être stocké dans localStorage');
      
      // Test 4: Test de l'API de progression avec le token
      console.log('\n🧪 Test 4: API de progression avec token');
      const progressResponse = await fetch(`${BACKEND_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        console.log('✅ API de progression accessible');
        console.log('📊 Données:', {
          niveau: progressData.data?.level,
          mots: progressData.data?.wordsWritten,
          precision: progressData.data?.accuracy
        });
      } else {
        console.log('❌ Erreur API de progression');
        const errorData = await progressResponse.json().catch(() => ({}));
        console.log('📝 Erreur:', errorData.error);
      }
    }
    
    // Test 5: Vérifier les CORS
    console.log('\n🧪 Test 5: Vérification des CORS');
    const corsResponse = await fetch(`${BACKEND_URL}/api/progress`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    
    console.log('📊 Status CORS:', corsResponse.status);
    console.log('📊 Headers CORS:', Object.fromEntries(corsResponse.headers.entries()));
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Test terminé');
}

testFrontendLogin().catch(console.error);
