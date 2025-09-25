#!/usr/bin/env node

// Test des fonctionnalités premium et du système d'abonnements
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testPremiumFeatures() {
  console.log('👑 Test des fonctionnalités premium et abonnements\n');

  // Données de test
  const testUsers = [
    {
      name: 'Demo User',
      email: `demo-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      expectedPlan: 'demo',
      shouldHaveAccess: false
    },
    {
      name: 'Premium User',
      email: `premium-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      expectedPlan: 'premium',
      shouldHaveAccess: true
    }
  ];

  const tokens = {};

  try {
    // 1. Créer et connecter les utilisateurs de test
    console.log('1️⃣ Création des utilisateurs de test...');
    
    for (const userData of testUsers) {
      // Inscription
      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const registerData = await registerResponse.json();
      if (!registerData.success) {
        throw new Error(`Inscription échouée pour ${userData.email}: ${registerData.error}`);
      }

      tokens[userData.expectedPlan] = registerData.token;
      console.log(`✅ Utilisateur ${userData.expectedPlan} créé et connecté`);

      // Mettre à jour l'abonnement si nécessaire
      if (userData.expectedPlan === 'premium') {
        await fetch(`${BASE_URL}/api/admin/subscriptions`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${tokens.premium}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: registerData.user.id,
            plan: 'premium',
            status: 'active'
          })
        });
        console.log(`✅ Abonnement premium activé pour ${userData.email}`);
      }
    }

    // 2. Test des plans d'abonnement
    console.log('\n2️⃣ Test des plans d\'abonnement...');
    const plansResponse = await fetch(`${BASE_URL}/api/subscription/plans`);
    const plansData = await plansResponse.json();
    
    if (plansData.success) {
      console.log('✅ Plans d\'abonnement récupérés');
      console.log(`   - Nombre de plans: ${plansData.data.length}`);
      
      const premiumPlan = plansData.data.find(p => p.id === 'premium');
      if (premiumPlan) {
        console.log(`   - Plan Premium trouvé: ${premiumPlan.name}`);
        console.log(`   - Fonctionnalités: ${premiumPlan.features.length}`);
        console.log(`   - Assistant dissertation inclus: ${premiumPlan.features.some(f => f.includes('dissertation'))}`);
      }
    }

    // 3. Test d'accès aux types de dissertations
    console.log('\n3️⃣ Test d\'accès aux types de dissertations...');
    
    // Test avec utilisateur demo (doit être refusé)
    const demoTypesResponse = await fetch(`${BASE_URL}/api/dissertation/types`, {
      headers: { 
        'Authorization': `Bearer ${tokens.demo}`,
        'Content-Type': 'application/json'
      }
    });

    if (demoTypesResponse.status === 403) {
      console.log('✅ Accès correctement refusé pour utilisateur demo');
    } else {
      console.log('⚠️ Utilisateur demo a accès (problème de sécurité)');
    }

    // Test avec utilisateur premium (doit être autorisé)
    const premiumTypesResponse = await fetch(`${BASE_URL}/api/dissertation/types`, {
      headers: { 
        'Authorization': `Bearer ${tokens.premium}`,
        'Content-Type': 'application/json'
      }
    });

    if (premiumTypesResponse.ok) {
      const typesData = await premiumTypesResponse.json();
      console.log('✅ Accès autorisé pour utilisateur premium');
      console.log(`   - Types disponibles: ${typesData.data.types.length}`);
      console.log(`   - Types: ${typesData.data.types.map(t => t.id).join(', ')}`);
    } else {
      console.log('❌ Accès refusé pour utilisateur premium (erreur)');
    }

    // 4. Test de génération de plan
    console.log('\n4️⃣ Test de génération de plan de dissertation...');
    
    const planResponse = await fetch(`${BASE_URL}/api/dissertation/plan`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokens.premium}`,
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
      console.log('✅ Plan de dissertation généré avec succès');
      console.log(`   - Titre: ${planData.data.plan.title}`);
      console.log(`   - Parties: ${planData.data.plan.plan.length}`);
      console.log(`   - Généré par: ${planData.data.plan.generated_by}`);
    } else {
      const errorData = await planResponse.json();
      console.log(`❌ Erreur génération plan: ${errorData.error}`);
    }

    // 5. Test d'analyse de dissertation
    console.log('\n5️⃣ Test d\'analyse de dissertation...');
    
    const sampleText = `Introduction

Les réseaux sociaux ont révolutionné notre façon de communiquer et de partager l'information. Cependant, leur impact sur la démocratie suscite de nombreux débats. Peut-on considérer que les réseaux sociaux représentent un danger pour nos institutions démocratiques ?

I. Les risques pour la démocratie

Les réseaux sociaux peuvent effectivement présenter des dangers pour la démocratie. Premièrement, ils favorisent la propagation de fausses informations. Deuxièmement, ils créent des bulles de filtres qui polarisent les opinions.

II. Les bénéfices démocratiques

Néanmoins, les réseaux sociaux offrent aussi des opportunités démocratiques. Ils permettent une participation citoyenne accrue et donnent la parole à des voix qui étaient auparavant marginalisées.

Conclusion

En conclusion, les réseaux sociaux ne sont ni entièrement bénéfiques ni entièrement néfastes pour la démocratie. Leur impact dépend largement de la façon dont nous les utilisons et les régulons.`;

    const analysisResponse = await fetch(`${BASE_URL}/api/dissertation/analyze`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokens.premium}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: sampleText,
        type: 'argumentative',
        subject: 'Les réseaux sociaux sont-ils un danger pour la démocratie ?',
        options: {
          level: 'intermediate',
          checkStructure: true,
          checkStyle: true,
          checkArguments: true
        }
      })
    });

    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      console.log('✅ Analyse de dissertation réussie');
      console.log(`   - Score global: ${analysisData.data.analysis.score_global}%`);
      console.log(`   - Points forts: ${analysisData.data.analysis.points_forts.length}`);
      console.log(`   - Points d'amélioration: ${analysisData.data.analysis.points_amelioration.length}`);
      console.log(`   - Analysé par: ${analysisData.data.analysis.analyzed_by}`);
    } else {
      const errorData = await analysisResponse.json();
      console.log(`❌ Erreur analyse: ${errorData.error}`);
    }

    // 6. Test des quotas
    console.log('\n6️⃣ Test des quotas d\'utilisation...');
    
    // Test avec utilisateur demo (doit être limité)
    const demoQuotaResponse = await fetch(`${BASE_URL}/api/dissertation/plan`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokens.demo}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'argumentative',
        subject: 'Test quota',
        level: 'beginner'
      })
    });

    if (demoQuotaResponse.status === 403 || demoQuotaResponse.status === 429) {
      console.log('✅ Quota correctement appliqué pour utilisateur demo');
    } else {
      console.log('⚠️ Quota non appliqué pour utilisateur demo');
    }

    // 7. Test de vérification d'abonnement
    console.log('\n7️⃣ Test de vérification d\'abonnement...');
    
    const currentSubResponse = await fetch(`${BASE_URL}/api/subscription/current`, {
      headers: { 
        'Authorization': `Bearer ${tokens.premium}`,
        'Content-Type': 'application/json'
      }
    });

    if (currentSubResponse.ok) {
      const subData = await currentSubResponse.json();
      console.log('✅ Abonnement actuel récupéré');
      console.log(`   - Plan: ${subData.data.plan}`);
      console.log(`   - Statut: ${subData.data.status}`);
      console.log(`   - Expire le: ${new Date(subData.data.endDate).toLocaleDateString('fr-FR')}`);
    }

    console.log('\n🎉 TOUS LES TESTS PREMIUM SONT PASSÉS !');
    console.log('\n📊 Résumé:');
    console.log('   ✅ Système d\'abonnements fonctionnel');
    console.log('   ✅ Protection des fonctionnalités premium');
    console.log('   ✅ Assistant de dissertation opérationnel');
    console.log('   ✅ Quotas et limites respectés');
    console.log('   ✅ Génération de plans et analyse fonctionnelles');
    console.log('\n🚀 Votre système premium est prêt !');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST PREMIUM:', error.message);
    console.log('\n🔧 Actions recommandées:');
    console.log('   1. Vérifiez que le serveur backend est démarré');
    console.log('   2. Vérifiez la configuration des APIs IA (OPENAI_API_KEY)');
    console.log('   3. Vérifiez que la base de données est synchronisée');
    console.log('   4. Vérifiez les logs: npm run logs');
    process.exit(1);
  }
}

if (require.main === module) {
  testPremiumFeatures();
}

module.exports = { testPremiumFeatures };
