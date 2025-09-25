#!/usr/bin/env node

// Test simple de connexion admin
const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 Test de connexion admin simple\n');

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@francaisfluide.com',
        password: 'Test!1234'
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ CONNEXION ADMIN RÉUSSIE !');
      console.log('Token:', data.token ? 'Présent' : 'Absent');
      console.log('Utilisateur:', data.user?.name);
      console.log('Rôle:', data.user?.role);
    } else {
      console.log('\n❌ CONNEXION ÉCHOUÉE');
      console.log('Erreur:', data.error);
    }

  } catch (error) {
    console.error('❌ ERREUR:', error.message);
  }
}

testLogin();
