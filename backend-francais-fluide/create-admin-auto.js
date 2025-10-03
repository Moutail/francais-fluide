// Script pour créer automatiquement un administrateur
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Création d\'un utilisateur administrateur...\n');

    const adminData = {
      name: 'Admin FrançaisFluide',
      email: 'admin@francais-fluide.com',
      password: 'Admin123!', // À changer après première connexion
      role: 'super_admin'
    };

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      console.log('⚠️  Un administrateur avec cet email existe déjà.');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Nom: ${existingAdmin.name}`);
      console.log(`🔑 Rôle: ${existingAdmin.role}`);
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        isActive: true
      }
    });

    // Créer la progression
    await prisma.userProgress.create({
      data: {
        userId: admin.id,
        level: 1,
        xp: 0,
        wordsWritten: 0,
        accuracy: 0,
        timeSpent: 0,
        exercisesCompleted: 0,
        currentStreak: 0
      }
    });

    // Créer un abonnement établissement
    await prisma.subscription.create({
      data: {
        userId: admin.id,
        plan: 'etablissement',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
      }
    });

    console.log('\n✅ Administrateur créé avec succès!\n');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('👤 Rôle:', adminData.role);
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après votre première connexion!\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

