// Script de test pour vérifier les restrictions de dictées
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_USERS = {
  demo: {
    email: 'demo@test.com',
    password: 'Test!1234',
    plan: 'demo'
  },
  etudiant: {
    email: 'etudiant@test.com', 
    password: 'Test!1234',
    plan: 'etudiant'
  },
  premium: {
    email: 'premium@test.com',
    password: 'Test!1234', 
    plan: 'premium'
  }
};

async function testDictationRestrictions() {
  console.log('🧪 Test des restrictions de dictées\n');
  
  for (const [planName, user] of Object.entries(TEST_USERS)) {
    console.log(`\n📋 Test pour le plan: ${planName.toUpperCase()}`);
    console.log('='.repeat(50));
    
    try {
      // 1. Connexion
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log(`✅ Connexion réussie pour ${user.email}`);
      
      // 2. Test d'accès à la liste des dictées
      try {
        const dictationsResponse = await axios.get(`${BASE_URL}/dictations`, { headers });
        console.log(`✅ Accès à la liste des dictées: ${dictationsResponse.data.data.dictations.length} dictées trouvées`);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`❌ Accès refusé à la liste des dictées: ${error.response.data.error}`);
        } else {
          console.log(`⚠️  Erreur inattendue: ${error.response?.data?.error || error.message}`);
        }
      }
      
      // 3. Test de soumission de dictée (si on a une dictée)
      try {
        // Récupérer une dictée d'abord
        const dictationsResponse = await axios.get(`${BASE_URL}/dictations`, { headers });
        if (dictationsResponse.data.data.dictations.length > 0) {
          const dictationId = dictationsResponse.data.data.dictations[0].id;
          
          const attemptResponse = await axios.post(
            `${BASE_URL}/dictations/${dictationId}/attempt`,
            {
              userText: 'Test de dictée pour vérifier les restrictions',
              timeSpent: 30
            },
            { headers }
          );
          
          console.log(`✅ Soumission de dictée réussie: Score ${attemptResponse.data.data.score}%`);
        }
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`❌ Soumission de dictée refusée: ${error.response.data.error}`);
          if (error.response.data.type === 'feature_not_available') {
            console.log(`   📝 Message: ${error.response.data.message}`);
            console.log(`   🔗 URL d'upgrade: ${error.response.data.upgradeUrl}`);
          }
        } else if (error.response?.status === 429) {
          console.log(`⚠️  Quota atteint: ${error.response.data.error}`);
          console.log(`   📊 Quota utilisé: ${error.response.data.used}/${error.response.data.quota}`);
        } else {
          console.log(`⚠️  Erreur inattendue: ${error.response?.data?.error || error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Erreur de connexion pour ${user.email}: ${error.response?.data?.error || error.message}`);
    }
  }
  
  console.log('\n🎯 Résumé des tests:');
  console.log('- Plan DEMO: Doit être refusé pour toutes les fonctionnalités de dictée');
  console.log('- Plan ÉTUDIANT: Doit avoir accès avec quota de 10 dictées/jour');
  console.log('- Plan PREMIUM: Doit avoir accès illimité');
}

// Fonction pour tester les quotas
async function testQuotaLimits() {
  console.log('\n\n🔢 Test des quotas de dictées\n');
  
  const user = TEST_USERS.etudiant;
  
  try {
    // Connexion
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log(`✅ Connexion réussie pour ${user.email}`);
    
    // Récupérer une dictée
    const dictationsResponse = await axios.get(`${BASE_URL}/dictations`, { headers });
    if (dictationsResponse.data.data.dictations.length > 0) {
      const dictationId = dictationsResponse.data.data.dictations[0].id;
      
      // Tenter plusieurs soumissions pour tester le quota
      for (let i = 1; i <= 12; i++) {
        try {
          const attemptResponse = await axios.post(
            `${BASE_URL}/dictations/${dictationId}/attempt`,
            {
              userText: `Tentative ${i} de dictée pour tester le quota`,
              timeSpent: 30
            },
            { headers }
          );
          
          console.log(`✅ Tentative ${i}: Score ${attemptResponse.data.data.score}%`);
        } catch (error) {
          if (error.response?.status === 429) {
            console.log(`⚠️  Tentative ${i}: Quota atteint après ${i-1} tentatives`);
            console.log(`   📊 Limite: ${error.response.data.quota} dictées/jour`);
            break;
          } else {
            console.log(`❌ Erreur tentative ${i}: ${error.response?.data?.error || error.message}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.error || error.message}`);
  }
}

// Exécuter les tests
async function runAllTests() {
  await testDictationRestrictions();
  await testQuotaLimits();
  
  console.log('\n✅ Tests terminés!');
  console.log('\n📝 Notes:');
  console.log('- Assurez-vous que le serveur backend est démarré sur le port 3001');
  console.log('- Les comptes de test doivent exister dans la base de données');
  console.log('- Les quotas se réinitialisent à minuit');
}

runAllTests().catch(console.error);

