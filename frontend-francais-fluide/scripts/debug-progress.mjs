// scripts/debug-progress.mjs
// Script pour diagnostiquer le problème de chargement de la progression

const BACKEND_URL = 'http://localhost:3001';

async function debugProgressLoading() {
  console.log('🔍 DIAGNOSTIC CHARGEMENT PROGRESSION');
  console.log('='.repeat(50));

  try {
    // Test 1: Connexion avec un compte d'abonnement
    console.log('\n🧪 Test 1: Authentification avec compte étudiant');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'etudiant@test.com',
        password: 'Test!1234',
      }),
    });

    if (!loginResponse.ok) {
      console.log("❌ Échec de l'authentification");
      const errorData = await loginResponse.json().catch(() => ({}));
      console.log('📝 Erreur:', errorData.error || loginResponse.statusText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Authentification réussie');
    console.log('👤 Utilisateur:', loginData.user?.name);
    console.log('🎓 Plan:', loginData.user?.subscription?.plan);
    console.log('🔑 Token reçu:', loginData.token ? 'Oui' : 'Non');

    if (!loginData.token) {
      console.log('❌ Aucun token reçu');
      return;
    }

    // Test 2: API Progression avec token
    console.log('\n🧪 Test 2: API Progression');
    const progressResponse = await fetch(`${BACKEND_URL}/api/progress`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Status de la réponse:', progressResponse.status);
    console.log('📊 Headers:', Object.fromEntries(progressResponse.headers.entries()));

    if (!progressResponse.ok) {
      console.log('❌ Erreur API Progression');
      const errorData = await progressResponse.json().catch(() => ({}));
      console.log('📝 Erreur:', errorData.error || progressResponse.statusText);
      console.log('📝 Détails:', errorData.details || 'Aucun détail');
      return;
    }

    const progressData = await progressResponse.json();
    console.log('✅ API Progression accessible');
    console.log('📊 Données reçues:', JSON.stringify(progressData, null, 2));

    // Test 3: Vérifier la structure des données
    console.log('\n🧪 Test 3: Structure des données');
    if (progressData.success) {
      console.log('✅ Structure correcte (success: true)');
      if (progressData.data) {
        console.log('✅ Données présentes');
        console.log('📈 Niveau:', progressData.data.level);
        console.log('📊 Mots écrits:', progressData.data.wordsWritten);
        console.log('🎯 Précision:', progressData.data.accuracy);
      } else {
        console.log('❌ Données manquantes');
      }
    } else {
      console.log('❌ Structure incorrecte (success: false)');
      console.log('📝 Erreur:', progressData.error);
    }

    // Test 4: Simulation du hook useProgress
    console.log('\n🧪 Test 4: Simulation du hook useProgress');
    try {
      // Simuler ce que fait le hook useApi
      const apiResponse = {
        success: progressData.success,
        data: progressData.data,
      };

      if (apiResponse.success) {
        console.log('✅ Hook useProgress devrait fonctionner');
        console.log('📊 Données extraites:', apiResponse.data);
      } else {
        console.log('❌ Hook useProgress échouerait');
        console.log('📝 Raison:', apiResponse.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.log('❌ Erreur dans la simulation du hook');
      console.log('📝 Erreur:', error.message);
    }
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    console.log('📝 Stack:', error.stack);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Diagnostic terminé');
}

debugProgressLoading().catch(console.error);
