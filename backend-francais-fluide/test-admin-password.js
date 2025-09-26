#!/usr/bin/env node

// Test des différents mots de passe pour le compte admin
const fetch = require('node-fetch');

async function testAdminPasswords() {
  console.log('🔐 Test des mots de passe admin\n');

  const passwords = [
    'Test!1234',
    'admin123',
    'Admin123!',
    'test123'
  ];

  const email = 'admin@francaisfluide.com';

  for (const password of passwords) {
    try {
      console.log(`Tentative avec: ${email} / ${password}`);
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log(`Status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ SUCCÈS avec ${password}`);
        console.log(`   - Nom: ${data.user.name}`);
        console.log(`   - Rôle: ${data.user.role}`);
        console.log(`   - Token: ${data.token ? 'Présent' : 'Absent'}\n`);
      } else {
        console.log(`❌ Échec: ${data.error}\n`);
      }

    } catch (error) {
      console.log(`❌ Erreur réseau: ${error.message}\n`);
    }
  }
}

testAdminPasswords();
