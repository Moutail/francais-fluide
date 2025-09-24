// scripts/test-all-pages.mjs
// Script pour tester toutes les pages qui utilisent l'API de progression

const BACKEND_URL = 'http://localhost:3001';

async function testAllPages() {
  console.log('🔍 TEST TOUTES LES PAGES');
  console.log('='.repeat(50));
  
  try {
    // Étape 1: Connexion
    console.log('\n📝 Étape 1: Connexion');
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
      console.log('❌ Échec de la connexion');
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie');
    console.log('👤 Utilisateur:', loginData.user?.name);
    console.log('🔑 Token reçu:', loginData.token ? 'Oui' : 'Non');
    
    const token = loginData.token;
    
    // Étape 2: Test Dashboard (utilise useProgress hook)
    console.log('\n📝 Étape 2: Test Dashboard');
    try {
      const dashboardResponse = await fetch(`${BACKEND_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard API accessible');
        console.log('📊 Données:', {
          success: dashboardData.success,
          hasData: !!dashboardData.data,
          niveau: dashboardData.data?.level
        });
      } else {
        console.log('❌ Erreur Dashboard API');
      }
    } catch (error) {
      console.log('❌ Erreur Dashboard:', error.message);
    }
    
    // Étape 3: Test Page Progression
    console.log('\n📝 Étape 3: Test Page Progression');
    try {
      const progressionResponse = await fetch(`${BACKEND_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (progressionResponse.ok) {
        const progressionData = await progressionResponse.json();
        console.log('✅ Page Progression API accessible');
        console.log('📊 Données:', {
          success: progressionData.success,
          hasData: !!progressionData.data,
          mots: progressionData.data?.wordsWritten
        });
      } else {
        console.log('❌ Erreur Page Progression API');
      }
    } catch (error) {
      console.log('❌ Erreur Page Progression:', error.message);
    }
    
    // Étape 4: Test Éditeur (GET)
    console.log('\n📝 Étape 4: Test Éditeur (GET)');
    try {
      const editorGetResponse = await fetch(`${BACKEND_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (editorGetResponse.ok) {
        const editorGetData = await editorGetResponse.json();
        console.log('✅ Éditeur GET API accessible');
        console.log('📊 Données:', {
          success: editorGetData.success,
          hasData: !!editorGetData.data,
          precision: editorGetData.data?.accuracy
        });
      } else {
        console.log('❌ Erreur Éditeur GET API');
      }
    } catch (error) {
      console.log('❌ Erreur Éditeur GET:', error.message);
    }
    
    // Étape 5: Test Éditeur (PUT)
    console.log('\n📝 Étape 5: Test Éditeur (PUT)');
    try {
      const editorPutResponse = await fetch(`${BACKEND_URL}/api/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wordsWritten: 700,
          accuracy: 89.5,
          timeSpent: 65,
          exercisesCompleted: 10,
          currentStreak: 1
        })
      });
      
      if (editorPutResponse.ok) {
        const editorPutData = await editorPutResponse.json();
        console.log('✅ Éditeur PUT API accessible');
        console.log('📊 Données mises à jour:', {
          success: editorPutData.success,
          hasData: !!editorPutData.data,
          nouveauxMots: editorPutData.data?.wordsWritten
        });
      } else {
        console.log('❌ Erreur Éditeur PUT API');
        const errorData = await editorPutResponse.json().catch(() => ({}));
        console.log('📝 Erreur:', errorData.error);
      }
    } catch (error) {
      console.log('❌ Erreur Éditeur PUT:', error.message);
    }
    
    // Étape 6: Test de déconnexion (simulation)
    console.log('\n📝 Étape 6: Test de déconnexion');
    try {
      // Simuler une requête avec un token invalide
      const invalidTokenResponse = await fetch(`${BACKEND_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer invalid_token`,
          'Content-Type': 'application/json'
        }
      });
      
      if (invalidTokenResponse.status === 401) {
        console.log('✅ Déconnexion automatique fonctionne (401 Unauthorized)');
      } else {
        console.log('⚠️ Déconnexion automatique ne fonctionne pas comme attendu');
        console.log('📊 Status:', invalidTokenResponse.status);
      }
    } catch (error) {
      console.log('❌ Erreur test déconnexion:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Test terminé');
  console.log('\n💡 Instructions pour tester dans le navigateur:');
  console.log('1. Allez sur http://localhost:3000');
  console.log('2. Connectez-vous avec: etudiant@test.com / Test!1234');
  console.log('3. Testez ces pages dans l\'ordre:');
  console.log('   - Dashboard (doit afficher les métriques)');
  console.log('   - Progression (doit afficher les graphiques)');
  console.log('   - Éditeur (doit sauvegarder la progression)');
  console.log('4. Vérifiez qu\'aucune déconnexion automatique ne se produit');
}

testAllPages().catch(console.error);
