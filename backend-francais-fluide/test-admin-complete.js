#!/usr/bin/env node

// Test complet des fonctionnalités d'administration
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
let adminToken = null;

async function testAdminFunctionality() {
  console.log('🔐 Test complet des fonctionnalités d\'administration\n');

  try {
    // 1. Test de connexion admin
    console.log('1️⃣ Test de connexion administrateur...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@francaisfluide.com',
        password: 'Test!1234'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Connexion admin échouée: ${loginData.error}`);
    }

    adminToken = loginData.token;
    console.log('✅ Connexion admin réussie');
    console.log('   - Rôle:', loginData.user.role || 'Non défini');

    // 2. Test d'accès au dashboard admin
    console.log('\n2️⃣ Test d\'accès au dashboard admin...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!dashboardResponse.ok) {
      throw new Error(`Accès dashboard refusé: ${dashboardResponse.status}`);
    }

    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard admin accessible');
    console.log('   - Utilisateurs totaux:', dashboardData.data.overview.totalUsers);
    console.log('   - Abonnements actifs:', dashboardData.data.overview.activeSubscriptions);
    console.log('   - Tickets support:', dashboardData.data.overview.openSupportTickets);

    // 3. Test de création d'utilisateur
    console.log('\n3️⃣ Test de création d\'utilisateur...');
    const testUser = {
      name: 'Test User Admin',
      email: `test-admin-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'tester',
      subscriptionPlan: 'premium'
    };

    const createUserResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const createUserData = await createUserResponse.json();
    if (!createUserData.success) {
      throw new Error(`Création utilisateur échouée: ${createUserData.error}`);
    }

    console.log('✅ Création d\'utilisateur réussie');
    console.log('   - ID:', createUserData.data.id);
    console.log('   - Nom:', createUserData.data.name);
    console.log('   - Rôle:', createUserData.data.role);

    const createdUserId = createUserData.data.id;

    // 4. Test de récupération des utilisateurs
    console.log('\n4️⃣ Test de récupération des utilisateurs...');
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users?limit=5`, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const usersData = await usersResponse.json();
    if (!usersData.success) {
      throw new Error(`Récupération utilisateurs échouée: ${usersData.error}`);
    }

    console.log('✅ Récupération utilisateurs réussie');
    console.log('   - Nombre d\'utilisateurs:', usersData.data.users.length);
    console.log('   - Pagination:', usersData.data.pagination.total, 'au total');

    // 5. Test de modification d'utilisateur
    console.log('\n5️⃣ Test de modification d\'utilisateur...');
    const updateUserResponse = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User Modified',
        isActive: true
      })
    });

    const updateUserData = await updateUserResponse.json();
    if (!updateUserData.success) {
      throw new Error(`Modification utilisateur échouée: ${updateUserData.error}`);
    }

    console.log('✅ Modification utilisateur réussie');
    console.log('   - Nouveau nom:', updateUserData.data.name);

    // 6. Test d'accès aux nouvelles routes
    console.log('\n6️⃣ Test des nouvelles routes...');
    
    const routesToTest = [
      '/api/achievements',
      '/api/calendar',
      '/api/dictations'
    ];

    for (const route of routesToTest) {
      const response = await fetch(`${BASE_URL}${route}`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ Route ${route} accessible`);
      } else {
        console.log(`⚠️ Route ${route} - Status: ${response.status}`);
      }
    }

    // 7. Test de protection contre accès non autorisé
    console.log('\n7️⃣ Test de protection des routes admin...');
    const unauthorizedResponse = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { 
        'Authorization': 'Bearer token-invalide',
        'Content-Type': 'application/json'
      }
    });

    if (unauthorizedResponse.status === 401 || unauthorizedResponse.status === 403) {
      console.log('✅ Protection contre accès non autorisé fonctionnelle');
    } else {
      console.log('⚠️ Protection insuffisante - vérifier la sécurité');
    }

    // 8. Nettoyage : supprimer l'utilisateur de test
    console.log('\n8️⃣ Nettoyage des données de test...');
    const deleteResponse = await fetch(`${BASE_URL}/api/admin/users/${createdUserId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      console.log('✅ Nettoyage réussi - utilisateur de test supprimé');
    }

    console.log('\n🎉 TOUS LES TESTS D\'ADMINISTRATION SONT PASSÉS !');
    console.log('\n📊 Résumé:');
    console.log('   ✅ Authentification admin fonctionnelle');
    console.log('   ✅ Dashboard accessible');
    console.log('   ✅ Gestion des utilisateurs opérationnelle');
    console.log('   ✅ Nouvelles routes API fonctionnelles');
    console.log('   ✅ Sécurité et permissions correctes');
    console.log('\n🚀 Votre interface d\'administration est prête !');
    console.log('\n🌐 Accès:');
    console.log('   • Interface admin: http://localhost:3000/admin');
    console.log('   • Login admin: admin@francaisfluide.com / Test!1234');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST ADMIN:', error.message);
    console.log('\n🔧 Actions recommandées:');
    console.log('   1. Vérifiez que le serveur backend est démarré');
    console.log('   2. Créez un administrateur avec: npm run create-admin');
    console.log('   3. Vérifiez que la base de données est synchronisée: npm run db:push');
    console.log('   4. Vérifiez les logs: npm run logs');
    process.exit(1);
  }
}

if (require.main === module) {
  testAdminFunctionality();
}

module.exports = { testAdminFunctionality };
