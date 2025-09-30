// Script de test pour vérifier le système d'abonnement
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001';

// Test des utilisateurs avec différents niveaux d'abonnement
const testUsers = [
  {
    name: 'Utilisateur Démo',
    email: 'demo@test.com',
    password: 'Test!1234',
    expectedPlan: 'demo',
  },
  {
    name: 'Étudiant Premium',
    email: 'etudiant@test.com',
    password: 'Test!1234',
    expectedPlan: 'etudiant',
  },
  {
    name: 'Professionnel',
    email: 'premium@test.com',
    password: 'Test!1234',
    expectedPlan: 'premium',
  },
  {
    name: 'Établissement',
    email: 'etablissement@test.com',
    password: 'Test!1234',
    expectedPlan: 'etablissement',
  },
];

async function testConnection() {
  console.log('🔍 Test de connexion...');

  try {
    // Test du frontend
    const frontendResponse = await fetch(`${BASE_URL}`);
    console.log(`✅ Frontend: ${frontendResponse.status} ${frontendResponse.statusText}`);

    // Test du backend
    const backendResponse = await fetch(`${API_URL}/api/health`);
    console.log(`✅ Backend: ${backendResponse.status} ${backendResponse.statusText}`);

    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log("\n👤 Test d'inscription des utilisateurs...");

  for (const user of testUsers) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${user.name} inscrit avec succès`);
      } else {
        console.log(`⚠️ ${user.name} déjà inscrit ou erreur: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ Erreur inscription ${user.name}:`, error.message);
    }
  }
}

async function testUserLogin() {
  console.log('\n🔐 Test de connexion des utilisateurs...');

  const tokens = {};

  for (const user of testUsers) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${user.name} connecté avec succès`);
        tokens[user.email] = data.token;
      } else {
        console.log(`❌ Erreur connexion ${user.name}: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ Erreur connexion ${user.name}:`, error.message);
    }
  }

  return tokens;
}

async function testSubscriptionAccess(tokens) {
  console.log("\n🎯 Test des accès par niveau d'abonnement...");

  for (const user of testUsers) {
    const token = tokens[user.email];
    if (!token) continue;

    try {
      // Test de récupération des données utilisateur
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const userPlan = data.user.subscription?.plan || 'demo';
        console.log(`✅ ${user.name} - Plan: ${userPlan} (attendu: ${user.expectedPlan})`);

        // Test des fonctionnalités selon le plan
        await testPlanFeatures(user.name, userPlan, token);
      } else {
        console.log(`❌ Erreur récupération données ${user.name}: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ Erreur test accès ${user.name}:`, error.message);
    }
  }
}

async function testPlanFeatures(userName, userPlan, token) {
  const features = [
    { name: 'Exercices', endpoint: '/api/exercises', required: 'demo' },
    { name: 'Progression', endpoint: '/api/progress', required: 'demo' },
    { name: 'Missions', endpoint: '/api/missions', required: 'demo' },
    { name: 'Dictées', endpoint: '/api/dictations', required: 'etudiant' },
    { name: 'Achievements', endpoint: '/api/achievements', required: 'etudiant' },
    { name: 'Admin', endpoint: '/api/admin/users', required: 'etablissement' },
  ];

  const planHierarchy = { demo: 0, etudiant: 1, premium: 2, etablissement: 3 };
  const userLevel = planHierarchy[userPlan] || 0;

  for (const feature of features) {
    const requiredLevel = planHierarchy[feature.required] || 0;
    const hasAccess = userLevel >= requiredLevel;

    try {
      const response = await fetch(`${API_URL}${feature.endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const hasAccessResponse = response.status !== 403;

      if (hasAccess === hasAccessResponse) {
        console.log(`  ✅ ${feature.name}: Accès correct`);
      } else {
        console.log(
          `  ❌ ${feature.name}: Accès incorrect (attendu: ${hasAccess}, reçu: ${hasAccessResponse})`
        );
      }
    } catch (error) {
      console.log(`  ⚠️ ${feature.name}: Erreur de test`);
    }
  }
}

async function testExerciseSubmission(tokens) {
  console.log("\n📝 Test de soumission d'exercices...");

  const etudiantToken = tokens['etudiant@test.com'];
  if (!etudiantToken) {
    console.log('❌ Token étudiant non disponible');
    return;
  }

  try {
    // Récupérer un exercice
    const exercisesResponse = await fetch(`${API_URL}/api/exercises`, {
      headers: {
        Authorization: `Bearer ${etudiantToken}`,
      },
    });

    const exercisesData = await exercisesResponse.json();

    if (exercisesData.success && exercisesData.data.length > 0) {
      const exercise = exercisesData.data[0];

      // Soumettre une réponse
      const submissionResponse = await fetch(`${API_URL}/api/exercises/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${etudiantToken}`,
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          answers: { q1: 'test' },
          timeSpent: 120,
        }),
      });

      const submissionData = await submissionResponse.json();

      if (submissionData.success) {
        console.log("✅ Soumission d'exercice réussie");
        console.log(`  Score: ${submissionData.data.score}%`);
        console.log(
          `  Réponses correctes: ${submissionData.data.correctAnswers}/${submissionData.data.totalQuestions}`
        );
      } else {
        console.log('❌ Erreur soumission exercice:', submissionData.error);
      }
    } else {
      console.log('❌ Aucun exercice disponible pour le test');
    }
  } catch (error) {
    console.error('❌ Erreur test soumission:', error.message);
  }
}

async function runAllTests() {
  console.log("🚀 Démarrage des tests du système d'abonnement\n");

  // Test de connexion
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('❌ Tests arrêtés - Problème de connexion');
    return;
  }

  // Test d'inscription
  await testUserRegistration();

  // Test de connexion
  const tokens = await testUserLogin();

  // Test des accès par abonnement
  await testSubscriptionAccess(tokens);

  // Test de soumission d'exercices
  await testExerciseSubmission(tokens);

  console.log('\n🎉 Tests terminés !');
}

// Exécuter les tests
runAllTests().catch(console.error);
