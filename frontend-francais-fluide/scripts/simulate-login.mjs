// scripts/simulate-login.mjs
// Script pour simuler une connexion complète et tester le dashboard

const BACKEND_URL = 'http://localhost:3001';

async function simulateLogin() {
  console.log('🔍 SIMULATION CONNEXION COMPLÈTE');
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
    console.log('🎓 Plan:', loginData.user?.subscription?.plan);
    
    // Étape 2: Stockage du token (simulation)
    console.log('\n📝 Étape 2: Stockage du token');
    const token = loginData.token;
    console.log('🔑 Token stocké dans localStorage (simulation)');
    
    // Étape 3: Test de l'API de profil
    console.log('\n📝 Étape 3: Test de l\'API de profil');
    const profileResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profil récupéré');
      console.log('👤 Nom:', profileData.user?.name);
      console.log('📊 Progression incluse:', !!profileData.user?.progress);
    } else {
      console.log('❌ Erreur récupération profil');
    }
    
    // Étape 4: Test de l'API de progression
    console.log('\n📝 Étape 4: Test de l\'API de progression');
    const progressResponse = await fetch(`${BACKEND_URL}/api/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (progressResponse.ok) {
      const progressData = await progressResponse.json();
      console.log('✅ Progression récupérée');
      console.log('📊 Données:', {
        niveau: progressData.data?.level,
        mots: progressData.data?.wordsWritten,
        precision: progressData.data?.accuracy,
        exercices: progressData.data?.exercisesCompleted
      });
    } else {
      console.log('❌ Erreur récupération progression');
      const errorData = await progressResponse.json().catch(() => ({}));
      console.log('📝 Erreur:', errorData.error);
    }
    
    // Étape 5: Test de mise à jour de progression
    console.log('\n📝 Étape 5: Test de mise à jour de progression');
    const updateResponse = await fetch(`${BACKEND_URL}/api/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wordsWritten: 600,
        accuracy: 88.5,
        exercisesCompleted: 9
      })
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Progression mise à jour');
      console.log('📊 Nouvelles données:', {
        mots: updateData.data?.wordsWritten,
        precision: updateData.data?.accuracy,
        exercices: updateData.data?.exercisesCompleted
      });
    } else {
      console.log('❌ Erreur mise à jour progression');
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Simulation terminée');
  console.log('\n💡 Instructions pour tester dans le navigateur:');
  console.log('1. Allez sur http://localhost:3000');
  console.log('2. Connectez-vous avec: etudiant@test.com / Test!1234');
  console.log('3. Vérifiez que le dashboard s\'affiche correctement');
}

simulateLogin().catch(console.error);
