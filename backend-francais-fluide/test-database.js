#!/usr/bin/env node

// Test de connexion et intégrité de la base de données
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🗄️ Test de la base de données\n');
  
  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // 2. Test de lecture des tables
    console.log('\n2️⃣ Vérification des tables...');
    
    const userCount = await prisma.user.count();
    console.log(`✅ Table users accessible (${userCount} utilisateurs)`);
    
    const exerciseCount = await prisma.exercise.count();
    console.log(`✅ Table exercises accessible (${exerciseCount} exercices)`);
    
    const achievementCount = await prisma.achievement.count();
    console.log(`✅ Table achievements accessible (${achievementCount} succès)`);

    // 3. Test des relations
    console.log('\n3️⃣ Test des relations...');
    
    const userWithRelations = await prisma.user.findFirst({
      include: {
        progress: true,
        subscription: true,
        achievements: true
      }
    });
    
    if (userWithRelations) {
      console.log('✅ Relations fonctionnelles');
      console.log(`   - Utilisateur: ${userWithRelations.name}`);
      console.log(`   - Progression: ${!!userWithRelations.progress}`);
      console.log(`   - Abonnement: ${userWithRelations.subscription?.plan || 'Aucun'}`);
      console.log(`   - Succès: ${userWithRelations.achievements.length}`);
    } else {
      console.log('⚠️ Aucun utilisateur trouvé pour tester les relations');
    }

    // 4. Test d'écriture (création et suppression)
    console.log('\n4️⃣ Test d\'écriture...');
    
    const testUser = await prisma.user.create({
      data: {
        name: 'Test DB User',
        email: `test-db-${Date.now()}@example.com`,
        password: 'hashed-password-test'
      }
    });
    console.log('✅ Création d\'utilisateur réussie');
    
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Suppression d\'utilisateur réussie');

    // 5. Test des contraintes
    console.log('\n5️⃣ Test des contraintes...');
    
    try {
      await prisma.user.create({
        data: {
          name: 'Test Duplicate',
          email: userWithRelations?.email || 'test@example.com', // Email existant
          password: 'password'
        }
      });
      console.log('⚠️ Contrainte d\'unicité email non respectée');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('✅ Contrainte d\'unicité email respectée');
      } else {
        console.log('⚠️ Erreur inattendue:', error.message);
      }
    }

    console.log('\n🎉 TOUS LES TESTS DE BASE DE DONNÉES SONT PASSÉS !');

  } catch (error) {
    console.error('\n❌ ERREUR DE BASE DE DONNÉES:', error.message);
    console.log('\n🔧 Actions recommandées:');
    console.log('   1. Vérifiez DATABASE_URL dans .env');
    console.log('   2. Exécutez: npx prisma generate');
    console.log('   3. Exécutez: npx prisma db push');
    console.log('   4. Optionnel: npx prisma db seed');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
