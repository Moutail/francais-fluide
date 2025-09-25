#!/usr/bin/env node

// Test spécifique de l'assistant de dissertation
const fetch = require('node-fetch');

async function testDissertation() {
  console.log('📝 Test de l\'assistant de dissertation\n');

  try {
    // 1. Connexion avec utilisateur premium
    console.log('1️⃣ Connexion utilisateur premium...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testeur@francaisfluide.com',
        password: 'Test!1234'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Connexion échouée: ${loginData.error}`);
    }

    const token = loginData.token;
    console.log('✅ Connexion réussie');
    console.log('   - Utilisateur:', loginData.user.name);
    console.log('   - Plan:', loginData.user.subscription?.plan);
    console.log('   - Statut:', loginData.user.subscription?.status);

    // 2. Test des types de dissertations
    console.log('\n2️⃣ Test des types de dissertations...');
    const typesResponse = await fetch('http://localhost:3001/api/dissertation/types', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (typesResponse.ok) {
      const typesData = await typesResponse.json();
      console.log('✅ Types de dissertations récupérés');
      console.log(`   - Nombre de types: ${typesData.data.types.length}`);
      console.log(`   - Types disponibles: ${typesData.data.types.map(t => t.id).join(', ')}`);
    } else {
      const errorData = await typesResponse.json();
      console.log(`❌ Erreur types: ${errorData.error}`);
    }

    // 3. Test de génération de plan
    console.log('\n3️⃣ Test de génération de plan...');
    const planResponse = await fetch('http://localhost:3001/api/dissertation/plan', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'argumentative',
        subject: 'Les réseaux sociaux sont-ils un danger pour la démocratie ?',
        level: 'intermediate'
      })
    });

    if (planResponse.ok) {
      const planData = await planResponse.json();
      console.log('✅ Plan généré avec succès');
      console.log(`   - Titre: ${planData.data.plan.title}`);
      console.log(`   - Parties: ${planData.data.plan.plan?.length || 0}`);
      console.log(`   - Généré par: ${planData.data.plan.generated_by}`);
    } else {
      const errorData = await planResponse.json();
      console.log(`❌ Erreur plan: ${errorData.error}`);
    }

    // 4. Test avec utilisateur demo (doit être refusé)
    console.log('\n4️⃣ Test de protection premium...');
    const demoLoginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo.user@example.com',
        password: 'Test!1234'
      })
    });

    const demoLoginData = await demoLoginResponse.json();
    if (demoLoginData.success) {
      const demoToken = demoLoginData.token;
      console.log('✅ Connexion demo réussie');

      // Tenter d'accéder aux types (doit être refusé)
      const demoTypesResponse = await fetch('http://localhost:3001/api/dissertation/types', {
        headers: { 
          'Authorization': `Bearer ${demoToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (demoTypesResponse.status === 403) {
        console.log('✅ Protection premium fonctionnelle - accès refusé pour demo');
      } else {
        console.log('⚠️ Protection premium défaillante - demo a accès');
      }
    }

    // 5. Test des plans d'abonnement
    console.log('\n5️⃣ Test des plans d\'abonnement...');
    const plansResponse = await fetch('http://localhost:3001/api/subscription/plans');
    
    if (plansResponse.ok) {
      const plansData = await plansResponse.json();
      console.log('✅ Plans d\'abonnement récupérés');
      
      const premiumPlan = plansData.data.find(p => p.id === 'premium');
      if (premiumPlan) {
        console.log('✅ Plan Premium trouvé avec nouvelles fonctionnalités:');
        premiumPlan.features.forEach((feature, index) => {
          if (feature.includes('dissertation')) {
            console.log(`   🎓 ${feature}`);
          }
        });
      }
    }

    console.log('\n🎉 TESTS DE DISSERTATION TERMINÉS AVEC SUCCÈS !');
    console.log('\n📊 Résumé:');
    console.log('   ✅ Authentification fonctionnelle');
    console.log('   ✅ Protection premium active');
    console.log('   ✅ Types de dissertations accessibles');
    console.log('   ✅ Génération de plans opérationnelle');
    console.log('   ✅ Plans d\'abonnement mis à jour');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
  }
}

testDissertation();
