// test-login.mjs
// Script pour tester la connexion avec tous les comptes d'abonnement

const BACKEND_URL = 'http://localhost:3001';

const testAccounts = [
  { email: 'demo@test.com', name: 'Utilisateur Démo', plan: 'demo' },
  { email: 'etudiant@test.com', name: 'Étudiant Premium', plan: 'etudiant' },
  { email: 'premium@test.com', name: 'Professionnel', plan: 'premium' },
  { email: 'etablissement@test.com', name: 'Établissement', plan: 'etablissement' }
];

async function testLogin(account) {
  try {
    console.log(`\n🧪 Test de connexion: ${account.name} (${account.plan})`);
    console.log(`   Email: ${account.email}`);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: account.email,
        password: 'Test!1234'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Connexion réussie');
      console.log('   👤 Nom:', data.user?.name);
      console.log('   🎓 Plan:', data.user?.subscription?.plan);
      console.log('   📊 Statut:', data.user?.subscription?.status);
      console.log('   🔑 Token:', data.token ? 'Reçu' : 'Manquant');
      
      // Test de l'API progression
      if (data.token) {
        const progressResponse = await fetch(`${BACKEND_URL}/api/progress`, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          console.log('   📈 Progression:');
          console.log('      - Niveau:', progressData.data?.level);
          console.log('      - XP:', progressData.data?.xp);
          console.log('      - Mots écrits:', progressData.data?.wordsWritten);
          console.log('      - Précision:', progressData.data?.accuracy + '%');
        } else {
          console.log('   ❌ Erreur API progression');
        }
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('   ❌ Échec de connexion');
      console.log('   📝 Erreur:', errorData.error || response.statusText);
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion');
    console.log('   📝 Erreur:', error.message);
  }
}

async function testAllAccounts() {
  console.log('🔍 TEST DE CONNEXION - COMPTES D\'ABONNEMENT');
  console.log('='.repeat(60));
  
  for (const account of testAccounts) {
    await testLogin(account);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test de connexion terminé');
}

testAllAccounts().catch(console.error);
