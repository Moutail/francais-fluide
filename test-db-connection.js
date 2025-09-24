const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // Test de connexion simple
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Test de requête simple
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs dans la base: ${userCount}`);
    
    // Vérifier si les comptes de test existent
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'test+'
        }
      },
      include: {
        subscription: true
      }
    });
    
    console.log(`👥 Comptes de test trouvés: ${testUsers.length}`);
    testUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.subscription?.plan || 'pas d\'abonnement'})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
